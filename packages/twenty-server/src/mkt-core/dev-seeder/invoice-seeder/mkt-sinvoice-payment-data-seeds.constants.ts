import { MKT_SINVOICE_DATA_SEEDS_IDS } from './mkt-sinvoice-data-seeds.constants';

type MktSInvoicePaymentDataSeed = {
  id: string;
  name: string;
  paymentMethodName: string;
  amount: number;
  currency: string;
  status: number;
  paymentDate: string;
  description: string;

  mktSInvoiceId: string;

  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_SINVOICE_PAYMENT_DATA_SEED_COLUMNS: (keyof MktSInvoicePaymentDataSeed)[] =
  [
    'id',
    'name',
    'paymentMethodName',
    'amount',
    'currency',
    'status',
    'paymentDate',
    'description',

    'mktSInvoiceId',

    'position',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_SINVOICE_PAYMENT_DATA_SEEDS_IDS = {
  ID_1: 'e209380e-e211-4bc9-9f7a-2993c7dfc804',
  ID_2: '48a54200-37a5-4e9c-b246-a8c2253e07e7',
  ID_3: '82e6f1cc-8040-4a2a-89af-e340d9571f38',
  ID_4: '8c7aad50-428b-414b-8c8d-4f0fb06904bb',
  ID_5: '28f02b0c-492a-4aa9-8626-d2276075a1dc',
};

export const MKT_SINVOICE_PAYMENT_DATA_SEEDS: MktSInvoicePaymentDataSeed[] = [
  {
    id: MKT_SINVOICE_PAYMENT_DATA_SEEDS_IDS.ID_1,
    name: 'Thanh toán Gaming Setup Combo',
    paymentMethodName: 'Chuyển khoản ngân hàng',
    amount: 162000,
    currency: 'VND',
    status: 1, // 1: Thành công, 0: Thất bại, 2: Đang xử lý
    paymentDate: '2024-12-15T10:35:00Z',
    description:
      'Thanh toán hóa đơn Gaming Setup Combo qua chuyển khoản ngân hàng',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_1,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_PAYMENT_DATA_SEEDS_IDS.ID_2,
    name: 'Thanh toán Office Essentials Bundle',
    paymentMethodName: 'Thẻ tín dụng',
    amount: 315000,
    currency: 'VND',
    status: 1,
    paymentDate: '2024-12-14T14:20:00Z',
    description: 'Thanh toán hóa đơn Office Essentials Bundle qua thẻ tín dụng',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_2,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_PAYMENT_DATA_SEEDS_IDS.ID_3,
    name: 'Thanh toán Coffee Lover Package',
    paymentMethodName: 'Tiền mặt',
    amount: 63000,
    currency: 'VND',
    status: 2, // Đang xử lý - chưa thanh toán xong
    paymentDate: '2024-12-13T09:50:00Z',
    description: 'Thanh toán hóa đơn Coffee Lover Package bằng tiền mặt',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_3,
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_PAYMENT_DATA_SEEDS_IDS.ID_4,
    name: 'Thanh toán Premium Audio Setup',
    paymentMethodName: 'Ví điện tử MoMo',
    amount: 189000,
    currency: 'VND',
    status: 1,
    paymentDate: '2024-12-12T16:25:00Z',
    description: 'Thanh toán hóa đơn Premium Audio Setup qua ví điện tử MoMo',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_4,
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_PAYMENT_DATA_SEEDS_IDS.ID_5,
    name: 'Thanh toán Home Office Bundle',
    paymentMethodName: 'Ví điện tử ZaloPay',
    amount: 252000,
    currency: 'VND',
    status: 1,
    paymentDate: '2024-12-11T11:15:00Z',
    description: 'Thanh toán hóa đơn Home Office Bundle qua ví điện tử ZaloPay',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_5,
    position: 5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
];
