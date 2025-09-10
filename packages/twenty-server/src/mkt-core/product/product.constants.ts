import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum MKT_PRODUCT_TYPE {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  SERVICE = 'SERVICE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  OTHER = 'OTHER',
}

export const MKT_PRODUCT_TYPE_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_PRODUCT_TYPE.PHYSICAL,
    label: 'Physical',
    position: 0,
    color: 'blue',
  },
  {
    value: MKT_PRODUCT_TYPE.DIGITAL,
    label: 'Digital',
    position: 1,
    color: 'purple',
  },
  {
    value: MKT_PRODUCT_TYPE.SERVICE,
    label: 'Service',
    position: 2,
    color: 'green',
  },
  {
    value: MKT_PRODUCT_TYPE.SUBSCRIPTION,
    label: 'Subscription',
    position: 3,
    color: 'orange',
  },
  {
    value: MKT_PRODUCT_TYPE.OTHER,
    label: 'Other',
    position: 4,
    color: 'gray',
  },
];
