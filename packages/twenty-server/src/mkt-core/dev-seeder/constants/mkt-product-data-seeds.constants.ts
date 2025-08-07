type MktProductDataSeed = {
  id: string;
  type: MKT_PRODUCT_TYPE;
  code: string;
  name: string;
  description: string;
  price: number;
  licenseDurationMonths: number;
  isActive: boolean;
  category: string;
  sku: string;
  inStock: boolean;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

// prettier-ignore
export enum MKT_PRODUCT_TYPE {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  SERVICE = 'SERVICE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  LICENSE = 'LICENSE',
  OTHER = 'OTHER',
}

// prettier-ignore
export const MKT_PRODUCT_DATA_SEED_COLUMNS: (keyof MktProductDataSeed)[] = [
  'id',
  'type',
  'code',
  'name',
  'description',
  'price',
  'licenseDurationMonths',
  'isActive',
  'category',
  'sku',
  'inStock',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

// prettier-ignore
export const MKT_PRODUCT_DATA_SEEDS_IDS = {
  ID_1: '20202020-a305-41e7-8c72-ba44072a4c58',
  ID_2: '20202020-a225-4b3d-a89c-7f6c30df998a',
  ID_3: '20202020-a8b0-422c-8fcf-5b7496f94975',
  ID_4: '20202020-aaf7-41d6-87a9-7add07bebfd8',
  ID_5: '20202020-a19d-422b-9cb2-5f8382a56877',
};

export const MKT_PRODUCT_DATA_SEEDS: MktProductDataSeed[] = [
  {
    id: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    type: MKT_PRODUCT_TYPE.PHYSICAL,
    code: 'ELEC-BTH-001',
    name: 'Wireless Bluetooth Headphones',
    description: 'Experience premium sound quality with these over-ear wireless Bluetooth headphones.',
    price: 129,
    licenseDurationMonths: 12,
    isActive: true,
    category: 'Electronics',
    sku: 'ELEC-BTH-001',
    inStock: true,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    type: MKT_PRODUCT_TYPE.PHYSICAL,
    code: 'FOOD-CFE-002',
    name: 'Organic Arabica Coffee Beans 1kg',
    description: '100% organic Arabica coffee beans, slow-roasted to perfection for a rich flavor.',
    price: 45,
    licenseDurationMonths: 12,
    isActive: true,
    category: 'Groceries',
    sku: 'FOOD-CFE-002',
    inStock: true,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    type: MKT_PRODUCT_TYPE.PHYSICAL,
    code: 'FURN-CHR-003',
    name: 'Ergonomic Office Chair',
    description: 'Adjustable ergonomic chair with lumbar support for long working hours.',
    price: 289,
    licenseDurationMonths: 12,
    isActive: true,
    category: 'Furniture',
    sku: 'FURN-CHR-003',
    inStock: true,
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_PRODUCT_DATA_SEEDS_IDS.ID_4,
    type: MKT_PRODUCT_TYPE.PHYSICAL,
    code: 'OUTD-WBT-004',
    name: 'Stainless Steel Water Bottle 750ml',
    description: 'Keep your drinks cold or hot for up to 12 hours with this eco-friendly bottle.',
    price: 25,
    licenseDurationMonths: 12,
    isActive: true,
    category: 'Outdoor & Travel',
    sku: 'OUTD-WBT-004',
    inStock: true,
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    type: MKT_PRODUCT_TYPE.PHYSICAL,
    code: 'HOME-LMP-005',
    name: 'LED Desk Lamp with USB Charging Port',
    description: 'Modern LED desk lamp with touch control, dimming, and built-in USB charger.',
    price: 59,
    licenseDurationMonths: 12,
    isActive: true,
    category: 'Home & Living',
    sku: 'HOME-LMP-005',
    inStock: true,
    position: 5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
];
