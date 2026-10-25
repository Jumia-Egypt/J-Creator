import { sb } from './supabase';
import { SubmissionItem } from './types';
import { buildSheetMatrix } from './bulkSheet';
import { fillUploadTemplate, TEMPLATE_FILE, XLSX_MIME } from './templateXlsx';

// Rows are fetched in slices so the barcode list never makes the request URL too long.
const BARCODE_SLICE = 100;

// Builds the Vendor Center template for a batch and saves it to the user's
// computer. Used by the Admin Portal and by the vendor's own download.
export async function downloadBatchSheet(items: SubmissionItem[], shopName: string, dateText?: string): Promise<void> {
  if (!items || items.length === 0) throw new Error('No items to export.');

  // Match each submitted item back to its real master_data row by barcode.
  const barcodes = Array.from(new Set(items.map(i => i.barcode).filter((b): b is string => !!b)));
  const byBarcode: Record<string, any> = {};
  for (let i = 0; i < barcodes.length; i += BARCODE_SLICE) {
    const { data, error } = await sb.from('master_data').select('*').in('barcode', barcodes.slice(i, i + BARCODE_SLICE));
    if (error) throw new Error('Catalog loading failed: ' + error.message);
    (data || []).forEach((m: any) => { if (m.barcode) byBarcode[m.barcode] = m; });
  }

  // The download is the Vendor Center template itself, with the
  // "Upload Template" tab filled in (see src/templateXlsx.ts).
  const templateRes = await fetch(import.meta.env.BASE_URL + TEMPLATE_FILE);
  if (!templateRes.ok) throw new Error('Template file could not be loaded (' + templateRes.status + ')');
  const bytes = await fillUploadTemplate(await templateRes.arrayBuffer(), buildSheetMatrix(items, byBarcode));

  const url = URL.createObjectURL(new Blob([bytes], { type: XLSX_MIME }));
  const link = document.createElement('a');
  link.href = url;
  const safeShop = (shopName || 'store').replace(/[^a-zA-Z0-9]/g, '_');
  const dateStamp = dateText ? dateText.slice(0, 10) : new Date().toISOString().slice(0, 10);
  link.download = `Jumia_BulkSheet_${safeShop}_${dateStamp}.xlsx`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
