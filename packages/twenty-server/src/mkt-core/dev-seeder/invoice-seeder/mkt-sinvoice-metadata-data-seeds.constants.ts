import { MKT_SINVOICE_DATA_SEEDS_IDS } from "src/mkt-core/dev-seeder/invoice-seeder/mkt-sinvoice-data-seeds.constants";

type MktSInvoiceMetadataDataSeed = {
  id: string;
  name: string;
  keyTag: string;
  stringValue: string;
  valueType: string;
  keyLabel: string;

  mktSInvoiceId: string;

  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_SINVOICE_METADATA_DATA_SEED_COLUMNS = [
  'id',
  'name',
  'keyTag',
  'stringValue',
  'valueType',
  'keyLabel',
  'mktSInvoiceId',
  'position',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const MKT_SINVOICE_METADATA_DATA_SEEDS_IDS = {
  ID_1: '9aa8cf9b-36a2-4c03-8525-cabbdcf865b8',
  ID_2: '578c7e7d-669f-429e-ab43-bc9fa1e4d16b',
  ID_3: '3c88d50d-0eba-4d76-81d3-cbcf02fd16d0',
  ID_4: 'db521bc7-547c-4308-bc74-6611fd358b31',
  ID_5: '86a41ca2-0d7d-4e5d-ba22-c0b783d2f664',
};

export const MKT_SINVOICE_METADATA_DATA_SEEDS: MktSInvoiceMetadataDataSeed[] = [
  {
    id: MKT_SINVOICE_METADATA_DATA_SEEDS_IDS.ID_1,
    name: 'Metadata - Gaming Setup Combo',
    keyTag: 'invoiceNote',
    stringValue: '',
    valueType: 'text',
    keyLabel: 'Ghi chú',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_1,
    position: 1,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_METADATA_DATA_SEEDS_IDS.ID_2,
    name: 'Metadata - Office Essentials Bundle',
    keyTag: 'invoiceNote',
    stringValue: '',
    valueType: 'text',
    keyLabel: 'Ghi chú',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_2,
    position: 2,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_METADATA_DATA_SEEDS_IDS.ID_3,
    name: 'Metadata - Coffee Lover Package',
    keyTag: 'invoiceNote',
    stringValue: '',
    valueType: 'text',
    keyLabel: 'Ghi chú',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_3,
    position: 3,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_METADATA_DATA_SEEDS_IDS.ID_4,
    name: 'Metadata - Premium Audio Setup',
    keyTag: 'invoiceNote',
    stringValue: '',
    valueType: 'text',
    keyLabel: 'Ghi chú',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_4,
    position: 4,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
  {
    id: MKT_SINVOICE_METADATA_DATA_SEEDS_IDS.ID_5,
    name: 'Metadata - Home Office Bundle',
    keyTag: 'invoiceNote',
    stringValue: '',
    valueType: 'text',
    keyLabel: 'Ghi chú',
    mktSInvoiceId: MKT_SINVOICE_DATA_SEEDS_IDS.ID_5,
    position: 5,
    createdBySource: 'API',
    createdByWorkspaceMemberId: null,
    createdByName: 'Tim A',
  },
];