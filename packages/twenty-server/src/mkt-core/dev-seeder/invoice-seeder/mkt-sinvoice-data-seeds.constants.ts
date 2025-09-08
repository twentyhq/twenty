import { MKT_ORDER_DATA_SEEDS_IDS } from 'src/mkt-core/dev-seeder/constants/mkt-order-data-seeds.constants';

type MktSInvoiceDataSeed = {
  id: string;
  name: string;
  //generalInvoiceInfo
  invoiceType: string;
  templateCode: string;
  invoiceSeries: string;
  currencyCode: string;
  exchangeRate: number;
  adjustmentType: string;
  paymentStatus: boolean;
  cusGetInvoiceRight: boolean;
  invoiceIssuedDate: string | null;
  transactionUuid: string;
  //buyerInfo
  buyerName: string;
  buyerLegalName: string;
  buyerTaxCode: string | null;
  buyerAddressLine: string;
  buyerPhoneNumber: string;
  buyerEmail: string;
  buyerIdNo: string | null;
  buyerIdType: string | null;
  buyerNotGetInvoice: string;

  //relations
  mktOrderId: string;

  sumOfTotalLineAmountWithoutTax: string;
  totalAmountAfterDiscount: string;
  totalAmountWithoutTax: string;
  totalTaxAmount: string;
  totalAmountWithTax: string;
  totalAmountWithTaxInWords: string;
  discountAmount: string;
  //metadata
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

// prettier-ignore
export const MKT_SINVOICE_DATA_SEED_COLUMNS: (keyof MktSInvoiceDataSeed)[] = [
  'id',
  'name',
  //generalInvoiceInfo
  'invoiceType',
  'templateCode',
  'invoiceSeries',
  'currencyCode',
  'exchangeRate',
  'adjustmentType',
  'paymentStatus',
  'cusGetInvoiceRight',
  'invoiceIssuedDate',
  'transactionUuid',
  //buyerInfo
  'buyerName',
  'buyerLegalName',
  'buyerTaxCode',
  'buyerAddressLine',
  'buyerPhoneNumber',
  'buyerEmail',
  'buyerIdNo',
  'buyerIdType',
  'buyerNotGetInvoice',
  //payments
  //relations
  'mktOrderId',
  'sumOfTotalLineAmountWithoutTax',
  'totalAmountAfterDiscount',
  'totalAmountWithoutTax',
  'totalTaxAmount',
  'totalAmountWithTax',
  'totalAmountWithTaxInWords',
  'discountAmount',
  //metadata
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const MKT_SINVOICE_DATA_SEEDS_IDS = {
  ID_1: 'b76f6171-4b20-4c05-b845-07491a5d5422',
  ID_2: 'b4b1d559-5080-48b5-a2ca-67dcb05d5261',
  ID_3: '8a0de4a7-542d-4801-9992-c37343caa58a',
  ID_4: 'cd205a2b-ea48-4e9d-8654-d70bf0021036',
  ID_5: 'a28fb3f7-c630-4af4-92b0-90d78d65855b',
};

// prettier-ignore
export const MKT_SINVOICE_DATA_SEEDS: MktSInvoiceDataSeed[] = [
  {
    id: MKT_SINVOICE_DATA_SEEDS_IDS.ID_1,
    name: 'Hóa đơn Gaming Setup Combo',
    //generalInvoiceInfo
    invoiceType: '1',
    templateCode: '1/770',
    invoiceSeries: 'K23TXM',
    currencyCode: 'VND',
    exchangeRate: 1,
    adjustmentType: '1',
    paymentStatus: true,
    cusGetInvoiceRight: true,
    invoiceIssuedDate: null,
    transactionUuid: 'uuid-gaming-setup-001',
    //buyerInfo
    buyerName: 'Nguyễn Văn An',
    buyerLegalName: 'Công ty TNHH An Gaming',
    buyerTaxCode: null,
    buyerAddressLine: '123 Đường ABC, Quận 1, TP.HCM',
    buyerPhoneNumber: '0901234567',
    buyerEmail: 'an.nguyen@gaming.com',
    buyerIdNo: '123456789',
    buyerIdType: null,
    buyerNotGetInvoice: '0',
    //relations
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_1,
    sumOfTotalLineAmountWithoutTax: '180000',
    totalAmountAfterDiscount: '162000',
    totalAmountWithoutTax: '162000',
    totalTaxAmount: '0',
    totalAmountWithTax: '162000',
    totalAmountWithTaxInWords: 'Một trăm sáu mươi hai nghìn đồng',
    discountAmount: '18000',
    //metadata
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_DATA_SEEDS_IDS.ID_2,
    name: 'Hóa đơn Office Essentials Bundle',
    //generalInvoiceInfo
    invoiceType: '1',
    templateCode: '1/770',
    invoiceSeries: 'K23TXM',
    currencyCode: 'VND',
    exchangeRate: 1,
    adjustmentType: '1',
    paymentStatus: true,
    cusGetInvoiceRight: true,
    invoiceIssuedDate: null,
    transactionUuid: 'uuid-office-essentials-002',
    //buyerInfo
    buyerName: 'Trần Thị Bình',
    buyerLegalName: 'Công ty TNHH Bình Office',
    buyerTaxCode: null,
    buyerAddressLine: '456 Đường XYZ, Quận 3, TP.HCM',
    buyerPhoneNumber: '0912345678',
    buyerEmail: 'binh.tran@office.com',
    buyerIdNo: '987654321',
    buyerIdType: null,
    buyerNotGetInvoice: '0',
    //relations
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_2,
    sumOfTotalLineAmountWithoutTax: '350000',
    totalAmountAfterDiscount: '315000',
    totalAmountWithoutTax: '315000',
    totalTaxAmount: '0',
    totalAmountWithTax: '315000',
    totalAmountWithTaxInWords: 'Ba trăm mười lăm nghìn đồng',
    discountAmount: '35000',
    //metadata
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_DATA_SEEDS_IDS.ID_3,
    name: 'Hóa đơn Coffee Lover Package',
    //generalInvoiceInfo
    invoiceType: '1',
    templateCode: '1/770',
    invoiceSeries: 'K23TXM',
    currencyCode: 'VND',
    exchangeRate: 1,
    adjustmentType: '1',
    paymentStatus: false,
    cusGetInvoiceRight: true,
    invoiceIssuedDate: null,
    transactionUuid: 'uuid-coffee-lover-003',
    //buyerInfo
    buyerName: 'Lê Văn Cường',
    buyerLegalName: 'Quán cà phê Cường',
    buyerTaxCode: null,
    buyerAddressLine: '789 Đường DEF, Quận 7, TP.HCM',
    buyerPhoneNumber: '0923456789',
    buyerEmail: 'cuong.le@coffee.com',
    buyerIdNo: '112233445',
    buyerIdType: null,
    buyerNotGetInvoice: '0',
    //relations
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_3,
    sumOfTotalLineAmountWithoutTax: '70000',
    totalAmountAfterDiscount: '63000',
    totalAmountWithoutTax: '63000',
    totalTaxAmount: '0',
    totalAmountWithTax: '63000',
    totalAmountWithTaxInWords: 'Sáu mươi ba nghìn đồng',
    discountAmount: '7000',
    //metadata
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_DATA_SEEDS_IDS.ID_4,
    name: 'Hóa đơn Premium Audio Setup',
    //generalInvoiceInfo
    invoiceType: '1',
    templateCode: '1/770',
    invoiceSeries: 'K23TXM',
    currencyCode: 'VND',
    exchangeRate: 1,
    adjustmentType: '1',
    paymentStatus: true,
    cusGetInvoiceRight: true,
    invoiceIssuedDate: null,
    transactionUuid: 'uuid-premium-audio-004',
    //buyerInfo
    buyerName: 'Phạm Thị Dung',
    buyerLegalName: 'Cửa hàng âm thanh Dung Audio',
    buyerTaxCode: null,
    buyerAddressLine: '321 Đường GHI, Quận 5, TP.HCM',
    buyerPhoneNumber: '0934567890',
    buyerEmail: 'dung.pham@audio.com',
    buyerIdNo: '556677889',
    buyerIdType: null,
    buyerNotGetInvoice: '0',
    //relations
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_4,
    sumOfTotalLineAmountWithoutTax: '210000',
    totalAmountAfterDiscount: '189000',
    totalAmountWithoutTax: '189000',
    totalTaxAmount: '0',
    totalAmountWithTax: '189000',
    totalAmountWithTaxInWords: 'Một trăm tám mươi chín nghìn đồng',
    discountAmount: '21000',
    //metadata
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_DATA_SEEDS_IDS.ID_5,
    name: 'Hóa đơn Home Office Bundle',
    //generalInvoiceInfo
    invoiceType: '1',
    templateCode: '1/770',
    invoiceSeries: 'K23TXM',
    currencyCode: 'VND',
    exchangeRate: 1,
    adjustmentType: '1',
    paymentStatus: true,
    cusGetInvoiceRight: true,
    invoiceIssuedDate: null,
    transactionUuid: 'uuid-home-office-005',
    //buyerInfo
    buyerName: 'Hoàng Văn Em',
    buyerLegalName: 'Công ty TNHH Em Home',
    buyerTaxCode: null,
    buyerAddressLine: '654 Đường JKL, Quận 10, TP.HCM',
    buyerPhoneNumber: '0945678901',
    buyerEmail: 'em.hoang@home.com',
    buyerIdNo: '998877665',
    buyerIdType: null,
    buyerNotGetInvoice: '0',
    //relations
    mktOrderId: MKT_ORDER_DATA_SEEDS_IDS.ID_5,
    sumOfTotalLineAmountWithoutTax: '280000',
    totalAmountAfterDiscount: '252000',
    totalAmountWithoutTax: '252000',
    totalTaxAmount: '0',
    totalAmountWithTax: '252000',
    totalAmountWithTaxInWords: 'Hai trăm năm mươi hai nghìn đồng',
    discountAmount: '28000',
    //metadata
    position: 5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
];
