import {
  FieldMetadataComplexOption,
  TagColor,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

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
  };
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
  };
  payments: {
    paymentMethodName: string;
  }[];
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
  }[];
  taxBreakdowns: {
    taxPercentage: number;
    taxableAmount: number;
    taxAmount: number;
  }[];
  summarizeInfo: {
    sumOfTotalLineAmountWithoutTax: number;
    totalAmountAfterDiscount: number;
    totalAmountWithoutTax: number;
    totalTaxAmount: number;
    totalAmountWithTax: number;
    totalAmountWithTaxInWords: string | null;
    discountAmount: number;
  };
  metadata: {
    keyTag: string;
    stringValue: string;
    valueType: string;
    keyLabel: string;
  }[];
};

export type GetInvoiceFileResponse = {
  errorCode: number;
  description: string | null;
  fileToBytes: string; // Base64 encoded PDF content
  fileName?: string; // File name from API response
  paymentStatus?: boolean; // Payment status from API response
};

export type GetInvoiceFileRequest = {
  supplierTaxCode: string;
  invoiceNo: string;
  templateCode: string;
  fileType: string; // "PDF"
};

export enum SINVOICE_FILE_STATUS {
  GETTING = 'GETTING',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
}

export const SINVOICE_FILE_STATUS_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: SINVOICE_FILE_STATUS.GETTING,
    label: 'GETTING',
    color: 'orange' as TagColor,
    position: 0,
  },
  {
    value: SINVOICE_FILE_STATUS.PENDING,
    label: 'PENDING',
    color: 'blue' as TagColor,
    position: 1,
  },
  {
    value: SINVOICE_FILE_STATUS.SUCCESS,
    label: 'SUCCESS',
    color: 'green' as TagColor,
    position: 2,
  },
  {
    value: SINVOICE_FILE_STATUS.FAILED,
    label: 'FAILED',
    color: 'red' as TagColor,
    position: 3,
  },
  {
    value: SINVOICE_FILE_STATUS.ERROR,
    label: 'ERROR',
    color: 'gray' as TagColor,
    position: 4,
  },
];

export enum SINVOICE_FILE_TYPE {
  PDF = 'PDF',
  ZIP = 'ZIP',
}

export const SINVOICE_FILE_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: SINVOICE_FILE_TYPE.PDF,
    label: 'PDF',
    color: 'blue' as TagColor,
    position: 0,
  },
  {
    value: SINVOICE_FILE_TYPE.ZIP,
    label: 'ZIP',
    color: 'green' as TagColor,
    position: 1,
  },
];
