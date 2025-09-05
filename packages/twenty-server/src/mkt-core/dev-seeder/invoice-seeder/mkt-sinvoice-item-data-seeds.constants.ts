import { MKT_SINVOICE_DATA_SEEDS_IDS } from "src/mkt-core/dev-seeder/invoice-seeder/mkt-sinvoice-data-seeds.constants";

type MktSInvoiceItemDataSeed = {
  id: string;
  name: string;
  lineNumber: number;
  selection: string;
  itemCode: string;
  itemName: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  itemTotalAmountWithoutTax: number;
  itemTotalAmountAfterDiscount: number;
  itemTotalAmountWithTax: number;
  taxPercentage: number;
  taxAmount: number;
  discount: number;
  itemDiscount: number;
  itemNote: string;
  isIncreaseItem: boolean;

  mktSInvoiceId: string;

  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_SINVOICE_ITEM_DATA_SEED_COLUMNS: (keyof MktSInvoiceItemDataSeed)[] = [
  'id',
  'name',
  'lineNumber',
  'selection',
  'itemCode',
  'itemName',
  'unitName',
  'quantity',
  'unitPrice',
  'itemTotalAmountWithoutTax',
  'itemTotalAmountAfterDiscount',
  'itemTotalAmountWithTax',
  'taxPercentage',
  'taxAmount',
  'discount',
  'itemDiscount',
  'itemNote',
  'isIncreaseItem',
  'mktSInvoiceId',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const MKT_SINVOICE_ITEM_DATA_SEEDS_IDS = {
  ID_1: 'ee2ca168-62e1-4043-ae84-8cc96fd54080',
  ID_2: '2849e75d-640e-4e37-ab80-1995c4d9708e',
  ID_3: '65958a0b-5e72-4c00-a815-4ba07dc7886b',
  ID_4: '0826443b-9372-4800-987c-7c4686dd405e',
  ID_5: '47989fd3-44ba-47ca-bef8-39b04c818075',
};

export const MKT_SINVOICE_ITEM_DATA_SEEDS: MktSInvoiceItemDataSeed[] = [
  {
    id: MKT_SINVOICE_ITEM_DATA_SEEDS_IDS.ID_1,
    name: 'Item - Gaming Setup Combo',
    lineNumber: 1,
    selection: '1',
    itemCode: '',
    itemName: 'Gaming Setup Combo',
    unitName: 'bộ',
    quantity: 1,
    unitPrice: 180000,
    itemTotalAmountWithoutTax: 180000,
    itemTotalAmountAfterDiscount: 162000,
    itemTotalAmountWithTax: 162000,
    taxPercentage: -2,
    taxAmount: 0,
    discount: 10,
    itemDiscount: 18000,
    itemNote: 'Giảm 10% theo chương trình khuyến mãi',
    isIncreaseItem: true,
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_1,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_ITEM_DATA_SEEDS_IDS.ID_2,
    name: 'Item - Office Essentials Bundle',
    lineNumber: 1,
    selection: '1',
    itemCode: '',
    itemName: 'Office Essentials Bundle',
    unitName: 'gói',
    quantity: 1,
    unitPrice: 350000,
    itemTotalAmountWithoutTax: 350000,
    itemTotalAmountAfterDiscount: 315000,
    itemTotalAmountWithTax: 315000,
    taxPercentage: -2,
    taxAmount: 0,
    discount: 10,
    itemDiscount: 35000,
    itemNote: 'Chiết khấu 10% khi mua theo combo',
    isIncreaseItem: true,
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_2,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_ITEM_DATA_SEEDS_IDS.ID_3,
    name: 'Item - Coffee Lover Package',
    lineNumber: 1,
    selection: '1',
    itemCode: '',
    itemName: 'Coffee Lover Package',
    unitName: 'gói',
    quantity: 1,
    unitPrice: 70000,
    itemTotalAmountWithoutTax: 70000,
    itemTotalAmountAfterDiscount: 63000,
    itemTotalAmountWithTax: 63000,
    taxPercentage: -2,
    taxAmount: 0,
    discount: 10,
    itemDiscount: 7000,
    itemNote: 'Giảm 10% theo chương trình khuyến mãi',
    isIncreaseItem: true,
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_3,
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_ITEM_DATA_SEEDS_IDS.ID_4,
    name: 'Item - Premium Audio Setup',
    lineNumber: 1,
    selection: '1',
    itemCode: '',
    itemName: 'Premium Audio Setup',
    unitName: 'bộ',
    quantity: 1,
    unitPrice: 210000,
    itemTotalAmountWithoutTax: 210000,
    itemTotalAmountAfterDiscount: 189000,
    itemTotalAmountWithTax: 189000,
    taxPercentage: -2,
    taxAmount: 0,
    discount: 10,
    itemDiscount: 21000,
    itemNote: 'Chiết khấu combo 10%',
    isIncreaseItem: true,
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_4,
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_ITEM_DATA_SEEDS_IDS.ID_5,
    name: 'Item - Home Office Bundle',
    lineNumber: 1,
    selection: '1',
    itemCode: '',
    itemName: 'Home Office Bundle',
    unitName: 'gói',
    quantity: 1,
    unitPrice: 280000,
    itemTotalAmountWithoutTax: 280000,
    itemTotalAmountAfterDiscount: 252000,
    itemTotalAmountWithTax: 252000,
    taxPercentage: -2,
    taxAmount: 0,
    discount: 10,
    itemDiscount: 28000,
    itemNote: 'Giảm 10% cho gói Home Office',
    isIncreaseItem: true,
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_5,
    position: 5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
];