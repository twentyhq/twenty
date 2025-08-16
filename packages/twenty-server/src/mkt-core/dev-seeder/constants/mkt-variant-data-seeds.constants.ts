import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { MKT_PRODUCT_DATA_SEEDS_IDS } from './mkt-product-data-seeds.constants';

type MktVariantDataSeed = {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  inStock: number;
  isActive: boolean;
  position: number;
  mktProductId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
};

// prettier-ignore
export const MKT_VARIANT_DATA_SEED_COLUMNS: (keyof MktVariantDataSeed)[] = [
  'id',
  'name',
  'description',
  'sku',
  'price',
  'inStock',
  'isActive',
  'position',
  'mktProductId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

// prettier-ignore
export const MKT_VARIANT_DATA_SEEDS_IDS = {
    // Product 1 variants (3 variants)
    ID_1: 'f6a07de5-1aef-4886-8922-4b429fe01267',
    ID_2: 'c56c687e-dfe4-4cb8-82ee-265c6aef58a5',
    ID_3: 'ae0330d8-4abf-4160-9e4e-eee8b47ffca1',
    
    // Product 2 variants (2 variants)
    ID_4: '1f7b4af8-0a48-4d71-9b21-ec3b00ec6e2d',
    ID_5: '64e023b6-f1d3-4d9e-bb8b-634eb53de819',
    
    // Product 3 variants (3 variants)
    ID_6: 'eab51cd9-2be7-439a-817f-8ad42f9c8513',
    ID_7: 'f2805e94-dbf6-4190-a793-50b25b1a4839',
    ID_8: '416e6835-99cd-490f-a432-3ee3f8ec7d00',
    
    // Product 4 variants (1 variant)
    ID_9: 'f4163ba9-ced1-4fdb-ba4b-f177f8bd6d87',
    
    // Product 5 variants (2 variants)
    ID_10: '4374ce86-af3f-478e-a864-e6f7c33cd708',
    ID_11: '33b1ac6f-cfd2-4923-a967-4bd9d420f9e9',
    // MKT INTERNAL VARIANTS
    MKT_CARE_BASIC_6_MONTHS_ID: '72129a6a-9225-461f-b895-0708793afbb6',
    MKT_CARE_BASIC_12_MONTHS_ID: 'fe1a2d04-dac6-437b-9159-b16543e9e48f',
    MKT_CARE_PREMIUM_12_MONTHS_ID: 'e79a9b79-cc4c-4179-bf98-73fddb61e5a5',
    MKT_EMAIL_PLUS_VN_ID: 'f69c2633-feb2-43c2-8626-c74dec6000f3',
    MKT_LICENSE_BIZ_1_YEAR_ID: '01fec833-0748-46b7-8fb3-06463ab1f04b',
};

//prettier-ignore
export const MKT_VARIANT_DATA_SEEDS: MktVariantDataSeed[] = [
  // MKT INTERNAL VARIANTS
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.MKT_CARE_BASIC_6_MONTHS_ID,
    name: 'MKT_CARE_BASIC_6_MONTHS',
    description: 'Gói chăm sóc MKT Basic – thời hạn 6 tháng, tối ưu cho nhu cầu cơ bản và tiết kiệm chi phí.',
    sku: 'MKT_CARE_BASIC_6_MONTHS',
    price: 4000000,
    inStock: 50,
    isActive: true,
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.MKT_CARE_BASIC,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.MKT_CARE_BASIC_12_MONTHS_ID,
    name: 'MKT_CARE_BASIC_12_MONTHS',
    description: 'Gói chăm sóc MKT Basic – thời hạn 12 tháng, giải pháp lâu dài với chi phí ưu đãi.',
    sku: 'MKT_CARE_BASIC_12_MONTHS',
    price: 7000000,
    inStock: 50,
    isActive: true,
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.MKT_CARE_BASIC,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.MKT_CARE_PREMIUM_12_MONTHS_ID,
    name: 'MKT_CARE_PREMIUM_12_MONTHS',
    description: 'Gói chăm sóc MKT Premium – 12 tháng, dịch vụ cao cấp với đầy đủ tính năng và ưu tiên hỗ trợ.',
    sku: 'MKT_CARE_PREMIUM_12_MONTHS',
    price: 10000000,
    inStock: 50,
    isActive: true,
    position: 3,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.MKT_CARE_PREMIUM,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.MKT_EMAIL_PLUS_VN_ID,
    name: 'MKT_EMAIL_PLUS_VN',
    description: 'Gói Email Plus dành riêng cho thị trường Việt Nam – nâng cao hiệu quả tiếp thị qua email.',
    sku: 'MKT_EMAIL_PLUS_VN',
    price: 1000000,
    inStock: 50,
    isActive: true,
    position: 4,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.MKT_EMAIL_PLUS,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.MKT_LICENSE_BIZ_1_YEAR_ID,
    name: 'MKT_LICENSE_BIZ_1_YEAR',
    description: 'License MKT Business – thời hạn 1 năm, đầy đủ quyền truy cập và tính năng cho doanh nghiệp.',
    sku: 'MKT_LICENSE_BIZ_1_YEAR',
    price: 10000000,
    inStock: 50,
    isActive: true,
    position: 5,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.MKT_LICENSE_BIZ,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  // Product 1: Wireless Bluetooth Headphones (3 variants)
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_1,
    name: 'Black - Standard',
    description: 'Classic black wireless Bluetooth headphones with premium sound quality',
    sku: 'ELEC-BTH-001-BLK',
    price: 129,
    inStock: 50,
    isActive: true,
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_2,
    name: 'White - Premium',
    description: 'Premium white wireless Bluetooth headphones with noise cancellation',
    sku: 'ELEC-BTH-001-WHT',
    price: 149,
    inStock: 30,
    isActive: true,
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_3,
    name: 'Blue - Limited Edition',
    description: 'Limited edition blue wireless Bluetooth headphones with custom design',
    sku: 'ELEC-BTH-001-BLU',
    price: 169,
    inStock: 15,
    isActive: true,
    position: 3,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 2: Organic Arabica Coffee Beans (2 variants)
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_4,
    name: 'Light Roast - 1kg',
    description: 'Light roasted organic Arabica coffee beans for a smooth, mild flavor',
    sku: 'FOOD-CFE-002-LIGHT',
    price: 45,
    inStock: 100,
    isActive: true,
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_5,
    name: 'Dark Roast - 1kg',
    description: 'Dark roasted organic Arabica coffee beans for a bold, rich flavor',
    sku: 'FOOD-CFE-002-DARK',
    price: 48,
    inStock: 75,
    isActive: true,
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 3: Ergonomic Office Chair (3 variants)
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_6,
    name: 'Black Mesh',
    description: 'Ergonomic office chair with black mesh back for breathability',
    sku: 'FURN-CHR-003-BLK',
    price: 289,
    inStock: 25,
    isActive: true,
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_7,
    name: 'Gray Leather',
    description: 'Ergonomic office chair with premium gray leather upholstery',
    sku: 'FURN-CHR-003-GRY',
    price: 349,
    inStock: 15,
    isActive: true,
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_8,
    name: 'Executive Model',
    description: 'Executive ergonomic office chair with additional lumbar support',
    sku: 'FURN-CHR-003-EXEC',
    price: 429,
    inStock: 10,
    isActive: true,
    position: 3,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 4: Stainless Steel Water Bottle (1 variant)
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_9,
    name: 'Classic Silver - 750ml',
    description: 'Classic silver stainless steel water bottle with 12-hour temperature retention',
    sku: 'OUTD-WBT-004-SILVER',
    price: 25,
    inStock: 200,
    isActive: true,
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },

  // Product 5: LED Desk Lamp (2 variants)
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_10,
    name: 'White Base - Touch Control',
    description: 'LED desk lamp with white base and touch control dimming',
    sku: 'HOME-LMP-005-WHT',
    price: 59,
    inStock: 40,
    isActive: true,
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
  {
    id: MKT_VARIANT_DATA_SEEDS_IDS.ID_11,
    name: 'Black Base - Remote Control',
    description: 'LED desk lamp with black base and remote control functionality',
    sku: 'HOME-LMP-005-BLK',
    price: 69,
    inStock: 30,
    isActive: true,
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    createdByName: 'Tim A',
  },
];
