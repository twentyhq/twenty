import {MKT_PRODUCT_DATA_SEEDS_IDS} from './mkt-product-data-seeds.constants';

type MktAttributeDataSeed = {
  id: string;
  name: string;
  position: number;
  mktProductId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

// prettier-ignore
export const MKT_ATTRIBUTE_DATA_SEED_COLUMNS: (keyof MktAttributeDataSeed)[] = [
  'id',
  'name',
  'position',
  'mktProductId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];
// prettier-ignore
export const MKT_ATTRIBUTE_DATA_SEEDS_IDS = {
  ID_1: '1bacf2e1-54ef-484e-8d5b-cb3bb4bd3853',
  ID_2: 'bdb3400f-c3bb-4194-9df1-dc93d33379d6',
  ID_3: '6d41f987-3682-4a99-a181-106ce3422242',
  ID_4: 'c324d781-7025-41e4-a45a-7675cbde361f',
  ID_5: '95878b9b-a4b8-4926-a776-855cb080dffa',
  ID_6: '0197a480-bab0-4f9a-b13e-eff89eaebab5',
  ID_7: '54543cf3-a6bb-4b0f-9427-c876b566db87',
  ID_8: 'b150cf28-da06-4127-9ba3-0edc418ab4ab',
  ID_9: 'd00573cc-845c-44bd-b71f-98ef811ae5cf',
  ID_10: '1b4f8f4e-c532-486c-9f0e-d7e60bd54bf2',
  ID_11: '871093ef-6888-4f59-91a3-6602b7df5bd6',
  ID_12: '292f1f1d-9551-48e2-9450-ab9252f81760',
  ID_13: '9ad7f2ba-0eab-43a0-9318-c6f766070172'
};

//prettier-ignore
export const MKT_ATTRIBUTE_DATA_SEEDS: MktAttributeDataSeed[] = [
  // Product 1: Wireless Bluetooth Headphones (Electronics) - 3 attributes
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_1,
    name: 'Color',
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_2,
    name: 'Battery Life',
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_3,
    name: 'Noise Cancellation',
    position: 3,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  
  // Product 2: Organic Arabica Coffee Beans (Groceries) - 2 attributes
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_4,
    name: 'Roast Level',
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_5,
    name: 'Origin',
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  
  // Product 3: Ergonomic Office Chair (Furniture) - 3 attributes
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_6,
    name: 'Material',
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_7,
    name: 'Weight Capacity',
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_8,
    name: 'Adjustable Features',
    position: 3,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  
  // Product 4: Stainless Steel Water Bottle (Outdoor & Travel) - 2 attributes
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_9,
    name: 'Capacity',
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_10,
    name: 'Insulation Type',
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  
  // Product 5: LED Desk Lamp (Home & Living) - 3 attributes
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_11,
    name: 'Color Temperature',
    position: 1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_12,
    name: 'Brightness Levels',
    position: 2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_ATTRIBUTE_DATA_SEEDS_IDS.ID_13,
    name: 'Mounting Type',
    position: 3,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  }
  
];
