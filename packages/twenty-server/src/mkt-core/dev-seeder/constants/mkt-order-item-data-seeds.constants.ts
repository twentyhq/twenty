type MktOrderItemDataSeed = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  position: number;
  mktOrderId: string;
  mktProductId: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

// prettier-ignore
export const MKT_ORDER_ITEM_DATA_SEED_COLUMNS: (keyof MktOrderItemDataSeed)[] = [
  'id',
  'name',
  'quantity',
  'unitPrice',
  'totalPrice',
  'position',
  'mktOrderId',
  'mktProductId',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

//prettier-ignore
export const MKT_ORDER_ITEM_DATA_SEEDS_IDS = {
  ID_1: '550e8400-e29b-41d4-a716-446655440001',
  ID_2: '550e8400-e29b-41d4-a716-446655440002',
  ID_3: '550e8400-e29b-41d4-a716-446655440003',
  ID_4: '550e8400-e29b-41d4-a716-446655440004',
  ID_5: '550e8400-e29b-41d4-a716-446655440005',
  ID_6: '550e8400-e29b-41d4-a716-446655440006',
  ID_7: '550e8400-e29b-41d4-a716-446655440007',
  ID_8: '550e8400-e29b-41d4-a716-446655440008',
  ID_9: '550e8400-e29b-41d4-a716-446655440009',
  ID_10: '550e8400-e29b-41d4-a716-44665544000a',
  ID_11: '550e8400-e29b-41d4-a716-44665544000b',
  ID_12: '550e8400-e29b-41d4-a716-44665544000c',
  ID_13: '550e8400-e29b-41d4-a716-44665544000d',
  ID_14: '550e8400-e29b-41d4-a716-44665544000e',
  ID_15: '550e8400-e29b-41d4-a716-44665544000f',
  ID_16: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  ID_17: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
  ID_18: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
  ID_19: '6ba7b813-9dad-11d1-80b4-00c04fd430c8',
  ID_20: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
};

// Import order and product seed IDs for relationships
import { MKT_ORDER_DATA_SEEDS_IDS } from './mkt-order-data-seeds.constants';
import { MKT_PRODUCT_DATA_SEEDS_IDS } from './mkt-product-data-seeds.constants';

// prettier-ignore
export const MKT_ORDER_ITEM_DATA_SEEDS: MktOrderItemDataSeed[] = [
  // Order 1: Enterprise Software License Renewal - Multiple license types
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_1,
    name: 'Core Enterprise License',
    quantity: 50,
    unitPrice: 300,
    totalPrice: 15000,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_2,
    name: 'Premium Support Package',
    quantity: 1,
    unitPrice: 10000,
    totalPrice: 10000,
    position: 2,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_1,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },

  // Order 2: Cloud Infrastructure Setup - Infrastructure components
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_3,
    name: 'Cloud Server Setup',
    quantity: 3,
    unitPrice: 2500,
    totalPrice: 7500,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_4,
    name: 'Load Balancer Configuration',
    quantity: 2,
    unitPrice: 3750,
    totalPrice: 7500,
    position: 2,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_2,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },

  // Order 3: Marketing Automation Platform - Single item
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_5,
    name: 'Marketing Automation License',
    quantity: 1,
    unitPrice: 8500,
    totalPrice: 8500,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_3,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mike Johnson',
  },

  // Order 4: Customer Support System - Multiple support tools
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_6,
    name: 'Ticketing System License',
    quantity: 1,
    unitPrice: 8000,
    totalPrice: 8000,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_4,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_7,
    name: 'Knowledge Base Setup',
    quantity: 1,
    unitPrice: 4000,
    totalPrice: 4000,
    position: 2,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_4,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },

  // Order 5: Data Analytics Dashboard - Analytics components
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_8,
    name: 'Dashboard Development',
    quantity: 1,
    unitPrice: 5000,
    totalPrice: 5000,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_5,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_9,
    name: 'Data Integration Service',
    quantity: 1,
    unitPrice: 2500,
    totalPrice: 2500,
    position: 2,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_5,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },

  // Order 6: E-commerce Platform Integration - E-commerce components
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_10,
    name: 'Platform Integration',
    quantity: 1,
    unitPrice: 12000,
    totalPrice: 12000,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_6,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mike Johnson',
  },
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_11,
    name: 'Payment Gateway Setup',
    quantity: 1,
    unitPrice: 6000,
    totalPrice: 6000,
    position: 2,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_6,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mike Johnson',
  },

  // Order 7: Mobile App Development - Mobile app components
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_12,
    name: 'iOS App Development',
    quantity: 1,
    unitPrice: 18000,
    totalPrice: 18000,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_7,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_13,
    name: 'Android App Development',
    quantity: 1,
    unitPrice: 17000,
    totalPrice: 17000,
    position: 2,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_7,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },

  // Order 8: Security Audit Services - Security components
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_14,
    name: 'Penetration Testing',
    quantity: 1,
    unitPrice: 6000,
    totalPrice: 6000,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_8,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_15,
    name: 'Security Report',
    quantity: 1,
    unitPrice: 3500,
    totalPrice: 3500,
    position: 2,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_8,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },

  // Order 9: Content Management System - Single item
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_16,
    name: 'CMS Setup and Training',
    quantity: 1,
    unitPrice: 6500,
    totalPrice: 6500,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_9,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mike Johnson',
  },

  // Order 10: API Gateway Implementation - API components
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_17,
    name: 'Gateway Configuration',
    quantity: 1,
    unitPrice: 7000,
    totalPrice: 7000,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_10,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_18,
    name: 'Microservices Integration',
    quantity: 1,
    unitPrice: 4000,
    totalPrice: 4000,
    position: 2,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_10,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'John Doe',
  },

  // Order 11: Business Intelligence Tools - Single license
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_19,
    name: 'BI Tools License',
    quantity: 1,
    unitPrice: 22000,
    totalPrice: 22000,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_11,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Jane Smith',
  },

  // Order 12: DevOps Pipeline Setup - DevOps components
  {
    id: MKT_ORDER_ITEM_DATA_SEEDS_IDS.ID_20,
    name: 'CI/CD Pipeline Setup',
    quantity: 1,
    unitPrice: 13500,
    totalPrice: 13500,
    position: 1,
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_12,
    mktProductId: MKT_PRODUCT_DATA_SEEDS_IDS.ID_5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Mike Johnson',
  },
];
