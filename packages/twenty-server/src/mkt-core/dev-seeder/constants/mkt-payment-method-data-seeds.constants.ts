type MktPaymentMethodDataSeed = {
  id: string;
  name: string;
  type: MKT_PAYMENT_METHOD_TYPE;
  description: string;
  isActive: boolean;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export enum MKT_PAYMENT_METHOD_TYPE {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  CASH = 'CASH',
  CHECK = 'CHECK',
  CRYPTOCURRENCY = 'CRYPTOCURRENCY',
  OTHER = 'OTHER',
}

export const MKT_PAYMENT_METHOD_DATA_SEED_COLUMNS: (keyof MktPaymentMethodDataSeed)[] =
  [
    'id',
    'name',
    'type',
    'description',
    'isActive',
    'position',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_PAYMENT_METHOD_DATA_SEEDS_IDS = {
  ID_1: '5a6b7c8d-9e0f-4a1b-8c2d-3e4f5a6b7c8d',
  ID_2: '1f2a3b4c-5d6e-4f7a-9b8c-7d6e5f4a3b2c',
  ID_3: '8e7f6a5b-4c3d-4e2f-a1b0-c9d8e7f6a5b4',
  ID_4: 'b4c3d2e1-f0a9-4b8c-a7b6-e5f4a3b2c1d0',
  ID_5: 'd2e1f0a9-b8c7-4d6e-9f5a-4b3c2d1e0f9a',
  ID_6: '7a6b5c4d-3e2f-4a1b-9c8d-7e6f5a4b3c2d',
  ID_7: 'c1b0a9d8-e7f6-4c5b-a4b3-f2e1d0c9b8a7',
  ID_8: '9d8c7b6a-5f4e-4d3c-b2a1-e0f9d8c7b6a5',
  ID_9: '4a3b2c1d-0e9f-4a8b-b7c6-d5e4f3a2b1c0',
};

export const MKT_PAYMENT_METHOD_DATA_SEEDS: MktPaymentMethodDataSeed[] = [
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_1,
    name: 'Credit Card',
    type: MKT_PAYMENT_METHOD_TYPE.CREDIT_CARD,
    description: 'Secure credit card payments via payment gateway',
    isActive: true,
    position: 1,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'System Admin',
  },
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_2,
    name: 'PayPal',
    type: MKT_PAYMENT_METHOD_TYPE.PAYPAL,
    description: 'PayPal online payment system',
    isActive: true,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'System Admin',
  },
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_3,
    name: 'Bank Transfer',
    type: MKT_PAYMENT_METHOD_TYPE.BANK_TRANSFER,
    description: 'Direct bank to bank transfer',
    isActive: true,
    position: 3,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Finance Team',
  },
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_4,
    name: 'Stripe',
    type: MKT_PAYMENT_METHOD_TYPE.STRIPE,
    description: 'Stripe payment processing platform',
    isActive: true,
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tech Team',
  },
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_5,
    name: 'Cash',
    type: MKT_PAYMENT_METHOD_TYPE.CASH,
    description: 'Cash payments for in-person transactions',
    isActive: true,
    position: 5,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Sales Team',
  },
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_6,
    name: 'Check',
    type: MKT_PAYMENT_METHOD_TYPE.CHECK,
    description: 'Paper check payments',
    isActive: false,
    position: 6,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'Finance Team',
  },
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_7,
    name: 'Cryptocurrency',
    type: MKT_PAYMENT_METHOD_TYPE.CRYPTOCURRENCY,
    description: 'Bitcoin and other cryptocurrency payments',
    isActive: false,
    position: 7,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tech Team',
  },
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_8,
    name: 'Debit Card',
    type: MKT_PAYMENT_METHOD_TYPE.DEBIT_CARD,
    description: 'Debit card payments via payment gateway',
    isActive: true,
    position: 8,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'System Admin',
  },
  {
    id: MKT_PAYMENT_METHOD_DATA_SEEDS_IDS.ID_9,
    name: 'Other',
    type: MKT_PAYMENT_METHOD_TYPE.OTHER,
    description: 'Alternative payment methods',
    isActive: false,
    position: 9,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: null,
    createdByName: 'System Admin',
  },
];
