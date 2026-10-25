import type JSZip from 'jszip';
import type { SheetCell } from './bulkSheet';

export const TEMPLATE_FILE = 'product-creation-template.xlsx';
export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const UPLOAD_SHEET = 'Upload Template';
const SST_PATH = 'xl/sharedStrings.xml';

const colLetter = (index: number): string => {
  let s = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  }
  return s;
};

// Control characters other than tab / newline / carriage return are not
// allowed in XML at all, so they are dropped.
const xmlEscape = (s: string): string =>
  s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Finds the XML file of a worksheet by its tab name, so this keeps working
// if the template's sheets are ever reordered.
async function findSheetPath(zip: JSZip, sheetName: string): Promise<string> {
  const workbook = await zip.file('xl/workbook.xml')!.async('string');
  const rels = await zip.file('xl/_rels/workbook.xml.rels')!.async('string');
  const tag = [...workbook.matchAll(/<sheet\b[^>]*>/g)].map(m => m[0]).find(t => t.includes(`name="${sheetName}"`));
  const rid = tag && /r:id="([^"]+)"/.exec(tag)?.[1];
  const target = rid && new RegExp(`<Relationship\\b[^>]*Id="${rid}"[^>]*>`).exec(rels)?.[0];
  const path = target && /Target="([^"]+)"/.exec(target)?.[1];
  if (!path) throw new Error(`The template has no "${sheetName}" tab.`);
  return 'xl/' + path.replace(/^\/?(xl\/)?/, '');
}

// Copies the Vendor Center template and fills its "Upload Template" tab:
// row 1 (headers) is kept as is, `matrix` rows (without the header) become
// rows 2, 3, ... Every other tab, the dropdown lists and the cell comments
// stay untouched.
export async function fillUploadTemplate(templateBytes: ArrayBuffer, matrix: SheetCell[][]): Promise<Uint8Array> {
  // Loaded only when an admin downloads, so vendors never pay for it.
  const { default: JSZipLib } = await import('jszip');
  const zip = await JSZipLib.loadAsync(templateBytes);

  const sheetPath = await findSheetPath(zip, UPLOAD_SHEET);
  let sheet = await zip.file(sheetPath)!.async('string');
  let sst = await zip.file(SST_PATH)!.async('string');

  const sstTag = /<sst\b[^>]*>/.exec(sst)![0];
  const count = Number(/\bcount="(\d+)"/.exec(sstTag)![1]);
  const unique = Number(/\buniqueCount="(\d+)"/.exec(sstTag)![1]);

  const newStrings = new Map<string, number>();
  let stringCells = 0;
  const stringIndex = (text: string): number => {
    stringCells++;
    let i = newStrings.get(text);
    if (i === undefined) {
      i = unique + newStrings.size;
      newStrings.set(text, i);
    }
    return i;
  };

  const dataRows = matrix.slice(1);
  const rowsXml = dataRows
    .map((cells, r) => {
      const rowNumber = r + 2;
      const cellsXml = cells
        .map((v, c) => {
          if (v === '' || v === null || v === undefined) return '';
          const ref = colLetter(c) + rowNumber;
          if (typeof v === 'number') return `<c r="${ref}"><v>${v}</v></c>`;
          return `<c r="${ref}" t="s"><v>${stringIndex(String(v))}</v></c>`;
        })
        .join('');
      return `<row r="${rowNumber}" spans="1:${cells.length}">${cellsXml}</row>`;
    })
    .join('');

  // keep only the header row, then add the data rows after it
  const headerRow = /<row r="1"[^>]*>.*?<\/row>/s.exec(sheet);
  if (!headerRow) throw new Error('The template\'s "Upload Template" tab has no header row.');
  sheet = sheet.replace(/<sheetData>.*<\/sheetData>/s, () => `<sheetData>${headerRow[0]}${rowsXml}</sheetData>`);
  const lastColumn = colLetter((matrix[0]?.length ?? 50) - 1);
  sheet = sheet.replace(/<dimension ref="[^"]*"\/>/, `<dimension ref="A1:${lastColumn}${dataRows.length + 1}"/>`);

  const newSi = [...newStrings.keys()].map(s => `<si><t xml:space="preserve">${xmlEscape(s)}</t></si>`).join('');
  const newSstTag = sstTag
    .replace(/\bcount="\d+"/, `count="${count + stringCells}"`)
    .replace(/\buniqueCount="\d+"/, `uniqueCount="${unique + newStrings.size}"`);
  const closeAt = sst.lastIndexOf('</sst>');
  sst = sst.slice(0, closeAt).replace(sstTag, newSstTag) + newSi + '</sst>';

  // createFolders: false keeps the package's entries exactly as in the template.
  zip.file(sheetPath, sheet, { createFolders: false });
  zip.file(SST_PATH, sst, { createFolders: false });
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}
