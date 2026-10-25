import { SubmissionItem } from './types';

// The 50-column Jumia Vendor Center "Product Creation Template" header row,
// in the exact order of the template file.
export const TEMPLATE_HEADERS = [
  'Name', 'Name_AR', 'Name_FR', 'Description', 'Description_AR', 'Description_FR', 'SellerSKU', 'ParentSKU',
  'Brand', 'PrimaryCategory', 'AdditionalCategory', 'GTIN_Barcode', 'Price_EGP', 'Sale_Price_EGP',
  'Sale_Price_Start_At', 'Sale_Price_End_At', 'Stock', 'variation', 'chipset_manufacturer', 'color', 'color_AR',
  'color_FR', 'color_family', 'condition', 'cpu_cores', 'cpu_speed', 'display_size', 'megapixels',
  'memory_capacity', 'model', 'network_coverage', 'operating_system', 'package_content', 'package_content_AR',
  'package_content_FR', 'product_warranty', 'product_weight', 'production_country', 'short_description',
  'short_description_AR', 'short_description_FR', 'storage_capacity', 'MainImage', 'Image2', 'Image3', 'Image4',
  'Image5', 'Image6', 'Image7', 'Image8',
];

// Vendor Center brand codes, keyed by lower-cased brand name as stored in
// master_data. The Brand column must read "<code> - <name>".
export const BRAND_CODES: Record<string, string> = {
  samsung: '1105823 - Samsung',
  xiaomi: '1122904 - Xiaomi',
  honor: '1053578 - Honor',
  infinix: '1056435 - Infinix',
  oppo: '1090530 - Oppo',
  vivo: '1120630 - vivo',
  realme: '1100882 - Realme',
  motorola: '1083105 - Motorola',
};

// Android is the only ecosystem vendors can pick today.
export const ANDROID_CATEGORY = '1002300 - Phones & Tablets / Mobile Phones / Smartphones / Android Phones';

const FIXED_PRICE_EGP = 100000;
const FIXED_STOCK = 0;
const FIXED_VARIATION = '...';
const FIXED_PRODUCT_WEIGHT = 1;

export const brandLabel = (brandName: string): string =>
  BRAND_CODES[brandName.trim().toLowerCase()] || brandName;

// `m` is the item's master_data row (matched by barcode); when there is no
// match, whatever was saved on the item itself is used instead.
export function buildSheetRow(item: SubmissionItem, m?: Record<string, any>): Record<string, string | number> {
  const barcode = m?.barcode || item.barcode || '';
  const sellerSku = item.supplierSku && item.supplierSku.trim() ? item.supplierSku.trim() : barcode;
  const color = m?.color || item.colorName || '';

  const row: Record<string, string | number> = {
    Name: m?.name_en || item.modelName || '',
    Name_AR: m?.name_ar || '',
    Description: m?.long_desc_en || '',
    Description_AR: m?.long_desc_ar || '',
    SellerSKU: sellerSku,
    ParentSKU: barcode,
    Brand: brandLabel(m?.brand || item.brandName || ''),
    PrimaryCategory: ANDROID_CATEGORY,
    GTIN_Barcode: barcode,
    Price_EGP: FIXED_PRICE_EGP,
    Stock: FIXED_STOCK,
    variation: FIXED_VARIATION,
    color,
    color_AR: color,
    model: m?.model_family || item.modelName || '',
    product_warranty: item.warrantyPeriod || '',
    product_weight: FIXED_PRODUCT_WEIGHT,
    production_country: item.productionCountry || '',
    short_description: m?.highlights_en || '',
    short_description_AR: m?.highlights_ar || '',
  };

  // Always the vendor's real, original links -- never `image1_hosted`
  // (our resized copy used only for on-site thumbnails).
  const images = m ? [m.image1, m.image2, m.image3, m.image4, m.image5, m.image6, m.image7] : [];
  const imageHeaders = ['MainImage', 'Image2', 'Image3', 'Image4', 'Image5', 'Image6', 'Image7'];
  imageHeaders.forEach((h, i) => { row[h] = (images[i] || '').trim(); });

  return row;
}

export type SheetCell = string | number;

// The sheet as rows of cells: the header row, then one row per item.
// Barcodes and SKUs stay text, so Excel never turns them into 8.8E+12.
export function buildSheetMatrix(items: SubmissionItem[], byBarcode: Record<string, any>): SheetCell[][] {
  const rows = items.map(item => {
    const row = buildSheetRow(item, item.barcode ? byBarcode[item.barcode] : undefined);
    return TEMPLATE_HEADERS.map(h => row[h] ?? '');
  });
  return [TEMPLATE_HEADERS, ...rows];
}
