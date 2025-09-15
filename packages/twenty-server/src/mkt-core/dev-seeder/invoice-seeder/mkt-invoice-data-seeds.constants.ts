
type MktInvoiceDataSeed = {
  id: string;
  name: string;
  amount: number;
  status: string;
  vat: number;
  totalAmount: number;
  sInvoiceCode: string;
  sentAt: string;
  mktOrderId: string;
  mktTemplateId: string;
  supplierTaxCode: string | null;
  invoiceType: string;
  templateCode: string;
  invoiceSeries: string;
  invoiceNo: string;
  transactionUuid: string;
  issueDate: string;
  totalWithoutTax: number;
  totalTax: number;
  totalWithTax: number;
  taxInWords: string;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

// prettier-ignore
export enum MKT_INVOICE_STATUS {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

// prettier-ignore
export const MKT_INVOICE_DATA_SEED_COLUMNS: (keyof MktInvoiceDataSeed)[] = [
  'id',
  'name',
  'amount',
  'status',
  'vat',
  'totalAmount',
  'sInvoiceCode',
  'sentAt',
  'mktOrderId',
  'mktTemplateId',
  'supplierTaxCode',
  'invoiceType',
  'templateCode',
  'invoiceSeries',
  'invoiceNo',
  'transactionUuid',
  'issueDate',
  'totalWithoutTax',
  'totalTax',
  'totalWithTax',
  'taxInWords',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

// prettier-ignore
export const MKT_INVOICE_DATA_SEEDS_IDS = {
  ID_1: 'f394dc63-41d1-4482-b7e4-caaa5b93f92b',
  ID_2: '637bc057-7630-4f6a-ad73-62f523656cc3',
  ID_3: '0d9743f8-bfd5-472c-9f9e-cb774a8afb60',
  ID_4: '23d2abed-4dc8-4621-b7a1-5f5f1bd1e899',
  ID_5: '3f2769a6-877a-4c10-b86c-b1aad173bb02',
  ID_6: '49c3cac1-9884-4bd3-ad1a-4f943acbe92a',
  ID_7: 'bfc66f26-094b-414d-beb4-fe03fc9b7ebc',
  ID_8: '4c882f44-fbf4-432f-95ee-3ab7cab0dc12',
  ID_9: '9513d334-1475-4597-aa55-65cff1584d56',
  ID_10: '99f9a370-5391-4f7c-8ee3-53d1ec43b0c6',
  ID_11: 'a77ae3b2-4ef3-45b0-95bd-32c9fb35f5ec',
  ID_12: 'f383bb89-fd48-4602-9703-29113a774890',
  ID_13: 'dcd1946c-3f0b-493e-8bb7-effc31097270',
  ID_14: '439241b7-f788-43a3-a167-abb87edf9ca7',
  ID_15: '60210650-18d3-436c-a313-b3a220a9a522',
};

// prettier-ignore
export const MKT_INVOICE_DATA_SEEDS: MktInvoiceDataSeed[] = [
];
