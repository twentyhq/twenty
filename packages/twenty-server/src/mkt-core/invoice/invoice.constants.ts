export type CreateInvoiceResponse = {
  transactionUuid?: string;
  invoiceNo?: string;
  message?: string;
  [key: string]: any;
  result: any;
};

export type sInvoiceType = {
  id?: string;
  name?: string;
  amount?: string;
  status?: string;
  vat?: number;
  totalAmount?: number;
  sInvoiceCode?: string;
  sentAt?: string;
  supplierTaxCode?: string | null;
  invoiceType?: string;
  templateCode?: string;
  invoiceSeries?: string;
  invoiceNo?: string;
  transactionUuid?: string;
  issueDate?: string;
  totalWithoutTax?: number;
  totalTax?: number;
  totalWithTax?: number;
  taxInWords?: string;
  mktOrderId?: string;
};

export type sInvoiceUpdate = {
  errorCode?: string | null;
  description?: string | null;
  supplierTaxCode?: string | null;
  invoiceNo?: string | null;
  transactionID?: string | null;
  reservationCode?: string | null;
  codeOfTax?: string | null;
  errorMessage?: string | null;
  errorData?: string | null;
  orderSInvoiceStatus?: string | null;
};

export type sInvoicePayload = {
  generalInvoiceInfo: {
    invoiceType: string;
    templateCode: string;
    invoiceSeries: string;
    currencyCode: string;
    exchangeRate: number;
    adjustmentType: string;
    paymentStatus: boolean;
    cusGetInvoiceRight: boolean;
    invoiceIssuedDate: number | null;
    transactionUuid: string | null;
  },
  buyerInfo: {
    buyerName: string;
    buyerLegalName: string | null;
    buyerTaxCode: string | null;
    buyerAddressLine: string;
    buyerPhoneNumber: string | null;
    buyerEmail: string | null;
    buyerIdNo: string | null;
    buyerIdType: string | null;
    buyerNotGetInvoice: string;
  },
  payments: {
    paymentMethodName: string;
  }[],
  itemInfo: {
    lineNumber: number;
    selection: number;
    itemCode: string | null;
    itemName: string;
    unitName: string | null;
    quantity: number | null;
    unitPrice: number | null;
    itemTotalAmountWithoutTax: number | null;
    itemTotalAmountAfterDiscount: number | null;
    itemTotalAmountWithTax: number | null;
    taxPercentage: number | null;
    taxAmount: number | null;
    discount: any | null;
    itemDiscount: any | null;
    itemNote: string | null;
    isIncreaseItem: boolean | null;
  }[],
  taxBreakdowns: {
    taxPercentage: number;
    taxableAmount: number;
    taxAmount: number;
  }[],
  summarizeInfo: {
    sumOfTotalLineAmountWithoutTax: number;
    totalAmountAfterDiscount: number;
    totalAmountWithoutTax: number;
    totalTaxAmount: number;
    totalAmountWithTax: number;
    totalAmountWithTaxInWords: string | null;
    discountAmount: number;
  },
  metadata: {
    keyTag: string;
    stringValue: string;
    valueType: string;
    keyLabel: string;
  }[],
};