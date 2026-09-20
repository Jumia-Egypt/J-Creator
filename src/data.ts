import { Brand, Category, DeviceType, ModelFamily, Variant } from './types';
import { sb } from './supabase';

// The exact 75-column Jumia Vendor Center bulk-upload template header row —
// copied verbatim from production (jumia-sku-creator-v2's src/data.ts) so a
// CSV downloaded from this sandbox opens as the identical template vendors
// already know, not a simplified custom sheet.
export const BULK_HEADERS = [
  "Name", "Name_AR", "Name_FR", "Description", "Description_AR", "Description_FR", "SellerSKU", "ParentSKU",
  "Brand", "PrimaryCategory", "GTIN_Barcode", "Price_EGP", "Sale_Price_EGP", "Sale_Price_Start_At",
  "Sale_Price_End_At", "Stock", "variation", "battery_feature", "bluetooth", "certifications", "chipset_manufacturer",
  "color", "color_AR", "color_FR", "color_family", "condition", "cpu_brand", "cpu_cores", "cpu_speed",
  "display_features", "display_size", "expandable_memory", "external_memory_slot", "extra_features",
  "graphics_processor", "health_features", "main_material", "manufacturer_txt", "material_family",
  "megapixels", "memory_capacity", "memory_technology", "model", "network_coverage", "note", "operating_system",
  "package_content", "package_content_AR", "package_content_FR", "panel_type", "product_line", "product_measures",
  "product_warranty", "product_weight", "production_country", "rear_camera", "screen_size", "security_features",
  "short_description", "short_description_AR", "short_description_FR", "sim_size", "storage_capacity",
  "warranty_address", "warranty_duration", "warranty_type", "youtube_id", "MainImage", "Image2", "Image3",
  "Image4", "Image5", "Image6", "Image7", "Image8"
];

export const categories: Category[] = [
  { id: 'phones', name: 'Phones', icon: 'Smartphone', available: true },
  { id: 'tablets', name: 'Tablets', icon: 'Tablet', available: false },
  { id: 'accessories', name: 'Accessories', icon: 'Headphones', available: false },
  { id: 'laptops', name: 'Laptops', icon: 'Laptop', available: false },
];

export const deviceTypes: DeviceType[] = [
  { id: 'android', name: 'Android', available: true },
  { id: 'ios', name: 'iOS', available: false },
  { id: 'feature', name: 'Feature Phones', available: false },
];

export const brands: Brand[] = [
  { id: 'samsung', name: 'Samsung', deviceTypeIds: ['android'] },
  { id: 'apple', name: 'Apple', deviceTypeIds: ['ios', 'laptops', 'tablets', 'accessories'] },
  { id: 'xiaomi', name: 'Xiaomi', deviceTypeIds: ['android', 'tablets', 'accessories'] },
  { id: 'honor', name: 'Honor', deviceTypeIds: ['android'] },
  { id: 'infinix', name: 'Infinix', deviceTypeIds: ['android'] },
  { id: 'oppo', name: 'Oppo', deviceTypeIds: ['android'] },
  { id: 'vivo', name: 'Vivo', deviceTypeIds: ['android'] },
  { id: 'realme', name: 'Realme', deviceTypeIds: ['android'] },
  { id: 'motorola', name: 'Motorola', deviceTypeIds: ['android'] },
];

export const modelFamilies: ModelFamily[] = [
  { id: 'ip15pm', brandId: 'apple', name: 'iPhone 15 Pro Max', isNew: false, tags: [] },
  { id: 'ip16pm', brandId: 'apple', name: 'iPhone 16 Pro Max', isNew: true, tags: ['New Launch'] },
  { id: 'redmi-13', brandId: 'xiaomi', name: 'Redmi Note 13', isNew: false, tags: [] },
  { id: 'redmi-14', brandId: 'xiaomi', name: 'Redmi Note 14 5G', isNew: true, tags: ['New Launch'] },
  { id: 'poco-x6c', brandId: 'xiaomi', name: 'POCO X6c', isNew: true, tags: ['New Launch'] },
  { id: 'honor-90', brandId: 'honor', name: 'Honor 90', isNew: false, tags: [] },

  { id: 'a07', brandId: 'samsung', name: 'Galaxy A07', isNew: true, tags: ['New Launch'] },
  { id: 'a17', brandId: 'samsung', name: 'Galaxy A17', isNew: true, tags: ['New Launch'] },
  { id: 'a17-5g', brandId: 'samsung', name: 'Galaxy A17 5G', isNew: true, tags: ['New Launch'] },
  { id: 'a26', brandId: 'samsung', name: 'Galaxy A26 5G', isNew: true, tags: ['New Launch'] },
  { id: 'a36', brandId: 'samsung', name: 'Galaxy A36 5G', isNew: true, tags: ['New Launch'] },
  { id: 'a56', brandId: 'samsung', name: 'Galaxy A56 5G', isNew: true, tags: ['New Launch'] },
  { id: 'a27', brandId: 'samsung', name: 'Galaxy A27 5G', isNew: true, tags: ['New Launch'] },
  { id: 'a37', brandId: 'samsung', name: 'Galaxy A37 5G', isNew: true, tags: ['New Launch'] },
  { id: 'a57', brandId: 'samsung', name: 'Galaxy A57 5G', isNew: true, tags: ['New Launch'] },
  { id: 's25-fe', brandId: 'samsung', name: 'Galaxy S25 FE', isNew: true, tags: ['New Launch'] },
  { id: 's25', brandId: 'samsung', name: 'Galaxy S25', isNew: true, tags: ['New Launch'] },
  { id: 's25-plus', brandId: 'samsung', name: 'Galaxy S25+', isNew: true, tags: ['New Launch'] },
  { id: 's25-ultra', brandId: 'samsung', name: 'Galaxy S25 Ultra', isNew: true, tags: ['New Launch'] },
  { id: 's26-fe', brandId: 'samsung', name: 'Galaxy S26 FE', isNew: true, tags: ['New Launch'] },
  { id: 's26', brandId: 'samsung', name: 'Galaxy S26', isNew: true, tags: ['New Launch'] },
  { id: 's26-plus', brandId: 'samsung', name: 'Galaxy S26+', isNew: true, tags: ['New Launch'] },
  { id: 's26-ultra', brandId: 'samsung', name: 'Galaxy S26 Ultra', isNew: true, tags: ['New Launch'] },
];

export const variants: Variant[] = [
// Galaxy S24+
  { id: 's24p-black', modelFamilyId: 's24-plus', color: 'Onyx Black', colorCode: '#222222', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },
  { id: 's24p-marble', modelFamilyId: 's24-plus', color: 'Marble Gray', colorCode: '#d4d4d4', thumbnailUrl: 'https://images.unsplash.com/photo-1707920150965-f938b813b5fc?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },

// iPhone 16 Pro Max
  { id: 'ip16pm-desert', modelFamilyId: 'ip16pm', color: 'Desert Titanium', colorCode: '#c2b29c', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB', '8GB/1TB'] },
  { id: 'ip16pm-black', modelFamilyId: 'ip16pm', color: 'Black Titanium', colorCode: '#3a3a3a', thumbnailUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB', '8GB/1TB'] },
  
  // iPhone 15 Pro Max
  { id: 'ip15pm-nt', modelFamilyId: 'ip15pm', color: 'Natural Titanium', colorCode: '#b7b5b2', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB', '8GB/1TB'] },
  { id: 'ip15pm-bt', modelFamilyId: 'ip15pm', color: 'Blue Titanium', colorCode: '#2c3545', thumbnailUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB', '8GB/1TB'] },

  // Redmi Note 14 5G
  { id: 'rn14-blue', modelFamilyId: 'redmi-14', color: 'Ice Blue', colorCode: '#98c3df', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/256GB'] },
  { id: 'rn14-black', modelFamilyId: 'redmi-14', color: 'Midnight Black', colorCode: '#222222', thumbnailUrl: 'https://images.unsplash.com/photo-1623307567794-6b95ce7d11f6?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/256GB'] },

  // Redmi Note 13
  { id: 'rn13-black', modelFamilyId: 'redmi-13', color: 'Midnight Black', colorCode: '#222222', thumbnailUrl: 'https://images.unsplash.com/photo-1623307567794-6b95ce7d11f6?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/256GB'] },
  { id: 'rn13-green', modelFamilyId: 'redmi-13', color: 'Mint Green', colorCode: '#8ab5a1', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/256GB'] },

  // POCO X6c
  { id: 'poco-x6c-black', modelFamilyId: 'poco-x6c', color: 'Midnight Black', colorCode: '#18181b', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/256GB'] },
  { id: 'poco-x6c-yellow', modelFamilyId: 'poco-x6c', color: 'POCO Yellow', colorCode: '#facc15', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '12GB/512GB'] },

  // Honor 90
  { id: 'h90-emerald', modelFamilyId: 'honor-90', color: 'Emerald Green', colorCode: '#1d483b', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '12GB/512GB'] },
  { id: 'h90-silver', modelFamilyId: 'honor-90', color: 'Diamond Silver', colorCode: '#e3e5e4', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '12GB/512GB'] },

  // Galaxy A07
  { id: 'a07-black', modelFamilyId: 'a07', color: 'Black', colorCode: '#111111', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['4GB/64GB', '4GB/128GB', '6GB/128GB', '8GB/256GB'] },
  { id: 'a07-green', modelFamilyId: 'a07', color: 'Green', colorCode: '#2f4f4f', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['4GB/64GB', '4GB/128GB', '6GB/128GB', '8GB/256GB'] },
  { id: 'a07-violet', modelFamilyId: 'a07', color: 'Light Violet', colorCode: '#d8bfd8', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['4GB/64GB', '4GB/128GB', '6GB/128GB', '8GB/256GB'] },

  // Galaxy A17
  { id: 'a17-black', modelFamilyId: 'a17', color: 'Black', colorCode: '#1a1a1a', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['4GB/128GB', '6GB/128GB', '8GB/256GB'] },
  { id: 'a17-grey', modelFamilyId: 'a17', color: 'Grey', colorCode: '#808080', thumbnailUrl: 'https://images.unsplash.com/photo-1707920150965-f938b813b5fc?w=200&h=200&fit=crop', storageOptions: ['4GB/128GB', '6GB/128GB', '8GB/256GB'] },
  { id: 'a17-blue', modelFamilyId: 'a17', color: 'Light Blue', colorCode: '#add8e6', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['4GB/128GB', '6GB/128GB', '8GB/256GB'] },

  // Galaxy A17 5G
  { id: 'a17-5g-black', modelFamilyId: 'a17-5g', color: 'Black', colorCode: '#1a1a1a', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB'] },
  { id: 'a17-5g-grey', modelFamilyId: 'a17-5g', color: 'Grey', colorCode: '#808080', thumbnailUrl: 'https://images.unsplash.com/photo-1707920150965-f938b813b5fc?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB'] },
  { id: 'a17-5g-blue', modelFamilyId: 'a17-5g', color: 'Blue', colorCode: '#4682b4', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB'] },

  // Galaxy A26 5G
  { id: 'a26-black', modelFamilyId: 'a26', color: 'Black', colorCode: '#121212', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/256GB'] },
  { id: 'a26-peach', modelFamilyId: 'a26', color: 'Peach Pink', colorCode: '#ffcba4', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/256GB'] },
  { id: 'a26-white', modelFamilyId: 'a26', color: 'White', colorCode: '#f8f8f8', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/256GB'] },

  // Galaxy A36 5G
  { id: 'a36-black', modelFamilyId: 'a36', color: 'Awesome Black', colorCode: '#1b1b1b', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB'] },
  { id: 'a36-lavender', modelFamilyId: 'a36', color: 'Awesome Lavender', colorCode: '#e6e6fa', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB'] },
  { id: 'a36-white', modelFamilyId: 'a36', color: 'Awesome White', colorCode: '#f5f5f5', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB'] },
  { id: 'a36-lime', modelFamilyId: 'a36', color: 'Awesome Lime', colorCode: '#32cd32', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB'] },

  // Galaxy A56 5G
  { id: 'a56-gray', modelFamilyId: 'a56', color: 'Awesome Light Gray', colorCode: '#d3d3d3', thumbnailUrl: 'https://images.unsplash.com/photo-1707920150965-f938b813b5fc?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB', '12GB/256GB'] },
  { id: 'a56-graphite', modelFamilyId: 'a56', color: 'Awesome Graphite', colorCode: '#53565b', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB', '12GB/256GB'] },
  { id: 'a56-olive', modelFamilyId: 'a56', color: 'Awesome Olive', colorCode: '#808000', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB', '12GB/256GB'] },
  { id: 'a56-pink', modelFamilyId: 'a56', color: 'Awesome Pink', colorCode: '#ffc0cb', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB', '12GB/256GB'] },

  // Galaxy A27 5G
  { id: 'a27-black', modelFamilyId: 'a27', color: 'Black', colorCode: '#111111', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/128GB', '8GB/256GB'] },
  { id: 'a27-blue', modelFamilyId: 'a27', color: 'Blue', colorCode: '#0000ff', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/128GB', '8GB/256GB'] },
  { id: 'a27-pink', modelFamilyId: 'a27', color: 'Light Pink', colorCode: '#ffb6c1', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['6GB/128GB', '8GB/128GB', '8GB/256GB'] },

  // Galaxy A37 5G
  { id: 'a37-charcoal', modelFamilyId: 'a37', color: 'Awesome Charcoal', colorCode: '#36454f', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB', '12GB/256GB'] },
  { id: 'a37-graygreen', modelFamilyId: 'a37', color: 'Awesome Gray Green', colorCode: '#5e716a', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB', '12GB/256GB'] },
  { id: 'a37-lavender', modelFamilyId: 'a37', color: 'Awesome Lavender', colorCode: '#e6e6fa', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB', '12GB/256GB'] },
  { id: 'a37-white', modelFamilyId: 'a37', color: 'Awesome White', colorCode: '#f5f5f5', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['8GB/128GB', '8GB/256GB', '12GB/256GB'] },

  // Galaxy A57 5G
  { id: 'a57-navy', modelFamilyId: 'a57', color: 'Awesome Navy', colorCode: '#000080', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '12GB/256GB', '12GB/512GB'] },
  { id: 'a57-gray', modelFamilyId: 'a57', color: 'Awesome Gray', colorCode: '#808080', thumbnailUrl: 'https://images.unsplash.com/photo-1707920150965-f938b813b5fc?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '12GB/256GB', '12GB/512GB'] },
  { id: 'a57-icyblue', modelFamilyId: 'a57', color: 'Awesome IcyBlue', colorCode: '#a5d3ed', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '12GB/256GB', '12GB/512GB'] },
  { id: 'a57-lilac', modelFamilyId: 'a57', color: 'Awesome Lilac', colorCode: '#c8a2c8', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '12GB/256GB', '12GB/512GB'] },

  // Galaxy S25 FE
  { id: 's25fe-black', modelFamilyId: 's25-fe', color: 'Jet Black', colorCode: '#000000', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },
  { id: 's25fe-navy', modelFamilyId: 's25-fe', color: 'Navy', colorCode: '#000080', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },
  { id: 's25fe-white', modelFamilyId: 's25-fe', color: 'White', colorCode: '#ffffff', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },
  { id: 's25fe-icyblue', modelFamilyId: 's25-fe', color: 'IcyBlue', colorCode: '#a5d3ed', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },

  // Galaxy S25
  { id: 's25-navy', modelFamilyId: 's25', color: 'Navy', colorCode: '#000080', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's25-icyblue', modelFamilyId: 's25', color: 'IcyBlue', colorCode: '#a5d3ed', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's25-mint', modelFamilyId: 's25', color: 'Mint', colorCode: '#3eb489', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's25-silver', modelFamilyId: 's25', color: 'Silver Shadow', colorCode: '#c0c0c0', thumbnailUrl: 'https://images.unsplash.com/photo-1707920150965-f938b813b5fc?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },

  // Galaxy S25+
  { id: 's25p-navy', modelFamilyId: 's25-plus', color: 'Navy', colorCode: '#000080', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's25p-icyblue', modelFamilyId: 's25-plus', color: 'IcyBlue', colorCode: '#a5d3ed', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's25p-mint', modelFamilyId: 's25-plus', color: 'Mint', colorCode: '#3eb489', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's25p-silver', modelFamilyId: 's25-plus', color: 'Silver Shadow', colorCode: '#c0c0c0', thumbnailUrl: 'https://images.unsplash.com/photo-1707920150965-f938b813b5fc?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },

  // Galaxy S25 Ultra
  { id: 's25u-black', modelFamilyId: 's25-ultra', color: 'Titanium Black', colorCode: '#1c1d1e', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB', '12GB/512GB', '12GB/1TB'] },
  { id: 's25u-silverblue', modelFamilyId: 's25-ultra', color: 'Titanium Silver Blue', colorCode: '#708090', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB', '12GB/512GB', '12GB/1TB'] },
  { id: 's25u-whitesilver', modelFamilyId: 's25-ultra', color: 'Titanium White Silver', colorCode: '#dcdcdc', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB', '12GB/512GB', '12GB/1TB'] },
  { id: 's25u-gray', modelFamilyId: 's25-ultra', color: 'Titanium Gray', colorCode: '#6a6b6d', thumbnailUrl: 'https://images.unsplash.com/photo-1707920150965-f938b813b5fc?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB', '12GB/512GB', '12GB/1TB'] },

  // Galaxy S26 FE
  { id: 's26fe-graphite', modelFamilyId: 's26-fe', color: 'Graphite', colorCode: '#4b4e53', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },
  { id: 's26fe-blueberry', modelFamilyId: 's26-fe', color: 'Blueberry', colorCode: '#4f86f7', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },
  { id: 's26fe-pistachio', modelFamilyId: 's26-fe', color: 'Pistachio', colorCode: '#93c572', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['8GB/256GB', '8GB/512GB'] },

  // Galaxy S26
  { id: 's26-black', modelFamilyId: 's26', color: 'Black', colorCode: '#111111', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's26-white', modelFamilyId: 's26', color: 'White', colorCode: '#f9f9f9', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's26-skyblue', modelFamilyId: 's26', color: 'Sky Blue', colorCode: '#87ceeb', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's26-violet', modelFamilyId: 's26', color: 'Cobalt Violet', colorCode: '#8a2be2', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },

  // Galaxy S26+
  { id: 's26p-black', modelFamilyId: 's26-plus', color: 'Black', colorCode: '#111111', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's26p-white', modelFamilyId: 's26-plus', color: 'White', colorCode: '#f9f9f9', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's26p-skyblue', modelFamilyId: 's26-plus', color: 'Sky Blue', colorCode: '#87ceeb', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },
  { id: 's26p-violet', modelFamilyId: 's26-plus', color: 'Cobalt Violet', colorCode: '#8a2be2', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB'] },

  // Galaxy S26 Ultra
  { id: 's26u-black', modelFamilyId: 's26-ultra', color: 'Black', colorCode: '#111111', thumbnailUrl: 'https://images.unsplash.com/photo-1698284698651-7f9e830e060a?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB', '12GB/512GB', '16GB/1TB'] },
  { id: 's26u-white', modelFamilyId: 's26-ultra', color: 'White', colorCode: '#f9f9f9', thumbnailUrl: 'https://images.unsplash.com/photo-1726715632420-96f30a91176b?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB', '12GB/512GB', '16GB/1TB'] },
  { id: 's26u-skyblue', modelFamilyId: 's26-ultra', color: 'Sky Blue', colorCode: '#87ceeb', thumbnailUrl: 'https://images.unsplash.com/photo-1601784551446-20c9e07cd56e?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB', '12GB/512GB', '16GB/1TB'] },
  { id: 's26u-violet', modelFamilyId: 's26-ultra', color: 'Cobalt Violet', colorCode: '#8a2be2', thumbnailUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop', storageOptions: ['12GB/256GB', '12GB/512GB', '16GB/1TB'] },
];

export const getBrandById = (id: string) => brands.find(b => b.id === id);
export const getBrandsByDeviceType = (deviceTypeId: string) => brands.filter(b => b.deviceTypeIds.includes(deviceTypeId));
export const getModelFamilyById = (id: string) => modelFamilies.find(m => m.id === id);
export const getModelFamiliesByBrand = (brandId: string) => modelFamilies.filter(m => m.brandId === brandId);
export const getVariantsByModelId = (modelId: string) => variants.filter(v => v.modelFamilyId === modelId);

// ---------------------------------------------------------------------------
// SANDBOX DATABASE WIRING
// ---------------------------------------------------------------------------
// The arrays above (`modelFamilies`, `variants`) ship with a small static
// sample catalog so the design renders instantly. `loadLiveCatalog()`
// replaces their *contents* (same array references, so every existing
// import/function above keeps working unchanged) with real rows pulled
// from the sandbox Supabase project once the app mounts. If the fetch
// fails for any reason, the static sample data above is left in place.

const BRAND_NAME_TO_ID: Record<string, string> = {};
brands.forEach(b => { BRAND_NAME_TO_ID[b.name.toLowerCase()] = b.id; });

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// The UI no longer displays a color swatch circle (just the phone image and
// color name), so this is a fixed placeholder — kept only because the
// Variant type still has a colorCode field a few other places read.
const colorNameToSwatch = (_name: string): string => '#9CA3AF';

// Raw hotlinked images (e.g. i.ibb.co, i.postimg.cc) are served full-size
// and uncached, which is slow in the UI's variant grid (multiple images
// load at once). Route those through wsrv.nl — a free public image proxy —
// to resize to the actual thumbnail size and re-encode as WebP, cached at
// its edge.
const toFastThumbnail = (rawUrl: string): string => {
  if (!rawUrl) return rawUrl;
  return `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&w=400&output=webp&q=80`;
};

// `image1_hosted` is only a genuine pre-optimized copy when it differs from
// the raw `image1` URL (e.g. a real Supabase Storage asset). Some rows have
// `image1_hosted` populated with a plain copy of `image1` (same slow,
// un-proxied ibb.co/postimg.cc link) — in that case it must still be routed
// through the fast-thumbnail proxy, or the whole point of `toFastThumbnail`
// is silently bypassed.
const isGenuinelyOptimized = (hosted: string | null, raw: string | null): hosted is string =>
  !!hosted && hosted !== raw;

interface MasterDataRow {
  barcode: string | null;
  brand: string | null;
  model_family: string | null;
  ram: string | null;
  rom: string | null;
  color: string | null;
  image1: string | null;
  image1_hosted: string | null;
  is_new_launch: boolean | null;
}

// Parses "8GB/256GB" into [8, 256] so storage options can be sorted
// smallest-to-largest (ROM first, then RAM) instead of alphabetically —
// a plain string sort would put "12GB/256GB" before "4GB/64GB". Mirrors
// the equivalent fix production needed (its Round 10) for the same reason.
const parseStorage = (s: string): [number, number] => {
  const nums = s.match(/(\d+)\s*GB/gi)?.map(m => parseInt(m, 10)) || [];
  const ram = nums[0] || 0;
  const rom = nums[1] || 0;
  return [rom, ram];
};

export async function loadLiveCatalog(): Promise<boolean> {
  const { data, error } = await sb
    .from('master_data')
    .select('barcode, brand, model_family, ram, rom, color, image1, image1_hosted, is_new_launch')
    .order('id', { ascending: true });

  if (error || !data || data.length === 0) {
    console.error('loadLiveCatalog: could not load sandbox catalog, keeping static sample data', error);
    return false;
  }

  const famMap = new Map<string, ModelFamily>();
  const varMap = new Map<string, Variant & { storageSet: Set<string> }>();

  (data as MasterDataRow[]).forEach(row => {
    const brandId = row.brand ? BRAND_NAME_TO_ID[row.brand.toLowerCase()] : undefined;
    const modelFamilyName = row.model_family || '';
    if (!brandId || !modelFamilyName) return;

    const famId = slugify(`${brandId}-${modelFamilyName}`);
    const existingFam = famMap.get(famId);
    if (!existingFam) {
      famMap.set(famId, {
        id: famId,
        brandId,
        name: modelFamilyName,
        isNew: !!row.is_new_launch,
        tags: row.is_new_launch ? ['New Launch'] : []
      });
    } else if (row.is_new_launch && !existingFam.isNew) {
      existingFam.isNew = true;
      existingFam.tags = ['New Launch'];
    }

    const colorName = row.color || 'Standard';
    const varId = slugify(`${famId}-${colorName}`);
    const storage = [row.ram, row.rom].filter(Boolean).join('/');
    let v = varMap.get(varId);
    if (!v) {
      v = {
        id: varId,
        modelFamilyId: famId,
        color: colorName,
        colorCode: colorNameToSwatch(colorName),
        thumbnailUrl: isGenuinelyOptimized(row.image1_hosted, row.image1)
          ? row.image1_hosted
          : toFastThumbnail(row.image1 || ''),
        storageOptions: [],
        storageSet: new Set<string>(),
        storageBarcodes: {}
      };
      varMap.set(varId, v);
    }
    if (storage) {
      v.storageSet.add(storage);
      if (row.barcode && v.storageBarcodes && !v.storageBarcodes[storage]) {
        v.storageBarcodes[storage] = row.barcode;
      }
    }
  });

  const liveModelFamilies = Array.from(famMap.values());
  const liveVariants = Array.from(varMap.values()).map(v => ({
    id: v.id,
    modelFamilyId: v.modelFamilyId,
    color: v.color,
    colorCode: v.colorCode,
    thumbnailUrl: v.thumbnailUrl,
    storageOptions: Array.from(v.storageSet).sort((a, b) => {
      const [aRom, aRam] = parseStorage(a);
      const [bRom, bRam] = parseStorage(b);
      return aRom !== bRom ? aRom - bRom : aRam - bRam;
    }),
    storageBarcodes: v.storageBarcodes
  }));

  // Mutate in place so every existing import of these arrays elsewhere in
  // the app sees the live data without needing to change how it imports them.
  modelFamilies.length = 0;
  modelFamilies.push(...liveModelFamilies);
  variants.length = 0;
  variants.push(...liveVariants);

  return true;
}
