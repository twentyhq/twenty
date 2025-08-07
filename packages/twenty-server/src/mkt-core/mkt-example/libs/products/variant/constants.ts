import { PRODUCT_SEED_IDS } from 'src/mkt-core/mkt-example/libs/products/constants';
import { PRODUCT_VARIANT_IDS } from 'src/mkt-core/mkt-example/libs/products/constants';

export const VARIANT_TABLE_NAME = 'mktProductVariant';

export const PRODUCT_VARIANT_STANDARD_FIELD_IDS = {
  id: 'be40d66e-b97c-4d1b-90a2-3e09a213aabc',
  name: 'a2b3c4d5-9999-4888-b777-666655554444',
  sku: 'f6fa7566-8e9d-4c45-b62e-3d63f5893bb4',
  price: 'dfe69b8c-21df-45d3-8516-f4cb86b2e414',
  stock: '73f61d5a-1e7b-4c84-8fcf-5eb52bdbdd6b',
  isActive: '9a9e3c1f-8b20-4b29-94e1-42eae5026b9b',
  position: 'ae4655e3-164a-42cc-be87-d389a8cdc0a7',
  createdBy: 'cc1f7b95-9f5e-4704-886e-f81bde3643c8',
  createdBySource: 'e83d9c0d-9e6d-4b64-9bc3-bc7d33ef1242',
  createdByWorkspaceMemberId: '5b5023cb-c8ac-4807-9fd9-e7a98e8df2dc',
  createdByName: 'c6d3f69d-b0f6-44b3-a83c-3b367d91274c',
  product: 'e5f1a4d2-7c6f-4c31-bc2e-52d192f1fcd9',
  variantAttributeValues: '1c25dc90-3f86-44e7-9f13-815f5a06ed4d',
};

export const PRODUCT_VARIANT_DATA_SEED_COLUMNS = [
  'id',
  'name',
  'productId',
  'sku',
  'price',
  'stock',
  'isActive',
  'position',
  'createdAt',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const PRODUCT_VARIANT_DATA_SEEDS = PRODUCT_VARIANT_IDS.map((id, idx) => {
  const base = [
    { name: 'Biến thể 1 P001', productId: PRODUCT_SEED_IDS.P001, sku: 'SKU-P001-01', price: 100000, stock: 50, isActive: true, position: 1 },
    { name: 'Biến thể 2 P001', productId: PRODUCT_SEED_IDS.P001, sku: 'SKU-P001-02', price: 120000, stock: 30, isActive: true, position: 2 },
    { name: 'Biến thể 3 P001', productId: PRODUCT_SEED_IDS.P001, sku: 'SKU-P001-03', price: 90000, stock: 20, isActive: false, position: 3 },
    { name: 'Biến thể 1 P002', productId: PRODUCT_SEED_IDS.P002, sku: 'SKU-P002-01', price: 200000, stock: 30, isActive: true, position: 4 },
    { name: 'Biến thể 2 P002', productId: PRODUCT_SEED_IDS.P002, sku: 'SKU-P002-02', price: 210000, stock: 10, isActive: true, position: 5 },
    { name: 'Biến thể 1 P003', productId: PRODUCT_SEED_IDS.P003, sku: 'SKU-P003-01', price: 300000, stock: 5, isActive: true, position: 6 },
    { name: 'Biến thể 1 P004', productId: PRODUCT_SEED_IDS.P004, sku: 'SKU-P004-01', price: 400000, stock: 15, isActive: true, position: 7 },
    { name: 'Biến thể 2 P004', productId: PRODUCT_SEED_IDS.P004, sku: 'SKU-P004-02', price: 420000, stock: 8, isActive: false, position: 8 },
    { name: 'Biến thể 1 P005', productId: PRODUCT_SEED_IDS.P005, sku: 'SKU-P005-01', price: 500000, stock: 2, isActive: true, position: 9 },
  ];
  return {
    id,
    ...base[idx],
    createdAt: new Date().toISOString(),
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  };
});

export const PRODUCT_VARIANT_SEEDS_CONSTANT = {
  tableName: VARIANT_TABLE_NAME,
  pgColumns: PRODUCT_VARIANT_DATA_SEED_COLUMNS,
  recordSeeds: PRODUCT_VARIANT_DATA_SEEDS,
};
