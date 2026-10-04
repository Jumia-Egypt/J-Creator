export type ViewState = 
  | 'landing'
  | 'category'
  | 'condition'
  | 'device-type'
  | 'brand'
  | 'model'
  | 'variant'
  | 'queue'
  | 'export'
  | 'admin';

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon name or type
  available: boolean;
}

export interface DeviceType {
  id: string;
  name: string;
  available: boolean;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  deviceTypeIds: string[];
}

export interface ModelFamily {
  id: string;
  brandId: string;
  name: string;
  isNew: boolean;
  tags?: string[];
}

export interface Variant {
  id: string;
  modelFamilyId: string;
  color: string;
  colorCode: string;
  thumbnailUrl: string;
  storageOptions: string[];
  // Maps a storage string (e.g. "8GB/256GB") to the real master_data barcode
  // for that exact SKU — needed so a submission can carry the correct
  // barcode for CSV/admin enrichment (production's real join key).
  storageBarcodes?: Record<string, string>;
}

export interface SelectedVariant {
  variantId: string;
  storage: string;
  supplierSku?: string;
}

export interface QueueItem {
  id: string;
  modelFamily: ModelFamily;
  brand: Brand;
  selectedVariants: SelectedVariant[];
  productionCountry: string;
  warrantyPeriod: string;
  timestamp: number;
}

export interface SubmissionItem {
  brandName: string;
  modelName: string;
  variantId: string;
  colorName?: string;
  storage: string;
  productionCountry: string;
  warrantyPeriod: string;
  supplierSku?: string;
  barcode?: string;
}

export interface Submission {
  id: string;
  shopName: string;
  date: string;
  itemsCount: number;
  brands: string[];
  status: 'Processed' | 'Pending';
  items: SubmissionItem[];
  timestamp: number;
  batchId?: string; // sandbox-database batch id (submissions.batch_id)
}


export type Condition = 'new' | 'refurbished';
