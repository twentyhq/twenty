import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { PRODUCT_SEED_IDS } from 'src/mkt-core/mkt-example/libs/products/constants';

export const TABLE_NAME = 'mktProduct';

export enum PRODUCT_TYPE {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  SERVICE = 'SERVICE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  LICENSE = 'LICENSE',
  OTHER = 'OTHER',
}

export const PRODUCT_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  { value: PRODUCT_TYPE.PHYSICAL, label: 'Physical', position: 0, color: 'blue' },
  { value: PRODUCT_TYPE.DIGITAL, label: 'Digital', position: 1, color: 'purple' },
  { value: PRODUCT_TYPE.SERVICE, label: 'Service', position: 2, color: 'green' },
  { value: PRODUCT_TYPE.SUBSCRIPTION, label: 'Subscription', position: 3, color: 'orange' },
  { value: PRODUCT_TYPE.LICENSE, label: 'License', position: 4, color: 'yellow' },
  { value: PRODUCT_TYPE.OTHER, label: 'Other', position: 5, color: 'gray' },
];

export const PRODUCT_STANDARD_FIELD_IDS = {
  id: 'a3b2c1d4-1234-5678-9abc-def012345678',
  productCode: 'c5d4e3f6-3456-7890-bcde-f12345678901',
  productName: 'd6e5f4a7-4567-8901-cdef-123456789012',
  productCategory: 'e7f6a5b8-5678-9012-def1-234567890123',
  productType: 'c7e0f35e-9b25-4a32-8a47-2f42c6f1d4ba',
  basePrice: 'f8a7b6c9-6789-0123-ef12-345678901234',
  licenseDurationMonths: 'a9b8c7d0-7890-1234-f123-456789012345',
  isActive: 'b0c9d8e1-8901-2345-1234-567890123456',
  position: 'eb3c3991-42cf-43b1-a712-52b6c536feba',
  createdBy: 'c1d0e9f2-9012-3456-2345-678901234567',
  variants: 'e5f1a4d2-7c6f-4c31-bc2e-52d192f1fcd9',
  attributes: 'd1e2f3a4-1111-2222-3333-444455556667', // new field for attributes relation
  timelineActivities: 'f2e3d4c5-2222-3333-4444-555566667778', // new field for timeline activities relation
};

export const PRODUCT_DATA_SEED_COLUMNS = [
  'id',
  'productCode',
  'productName',
  'productCategory',
  'productType',
  'basePrice',
  'licenseDurationMonths',
  'isActive',
  'position',
  'createdAt',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
];

export const PRODUCT_DATA_SEEDS = [
  {
    id: PRODUCT_SEED_IDS.P001,
    productCode: 'P001',
    productName: 'CRM SaaS',
    productCategory: 'Software',
    productType: PRODUCT_TYPE.SUBSCRIPTION,
    basePrice: 199.99,
    licenseDurationMonths: 12,
    isActive: true,
    position: 1,
    createdAt: new Date().toISOString(),
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: PRODUCT_SEED_IDS.P002,
    productCode: 'P002',
    productName: 'Marketing Automation',
    productCategory: 'Software',
    productType: PRODUCT_TYPE.SUBSCRIPTION,
    basePrice: 299.99,
    licenseDurationMonths: 6,
    isActive: true,
    position: 2,
    createdAt: new Date().toISOString(),
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: PRODUCT_SEED_IDS.P003,
    productCode: 'P003',
    productName: 'Cloud Storage',
    productCategory: 'Service',
    productType: PRODUCT_TYPE.SERVICE,
    basePrice: 99.99,
    licenseDurationMonths: 24,
    isActive: false,
    position: 3,
    createdAt: new Date().toISOString(),
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: PRODUCT_SEED_IDS.P004,
    productCode: 'P004',
    productName: 'Email Marketing',
    productCategory: 'Service',
    productType: PRODUCT_TYPE.SERVICE,
    basePrice: 149.99,
    licenseDurationMonths: 12,
    isActive: true,
    position: 4,
    createdAt: new Date().toISOString(),
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
  {
    id: PRODUCT_SEED_IDS.P005,
    productCode: 'P005',
    productName: 'Social Media Scheduler',
    productCategory: 'Software',
    productType: PRODUCT_TYPE.DIGITAL,
    basePrice: 179.99,
    licenseDurationMonths: 6,
    isActive: true,
    position: 5,
    createdAt: new Date().toISOString(),
    createdBySource: 'SYSTEM',
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  },
];

export const PRODUCT_SEEDS_CONSTANT = {
  tableName: TABLE_NAME,
  pgColumns: PRODUCT_DATA_SEED_COLUMNS,
  recordSeeds: PRODUCT_DATA_SEEDS,
};
