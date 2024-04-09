import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const currencyCompositeType: CompositeType = {
  type: FieldMetadataType.CURRENCY,
  properties: [
    {
      name: 'amountMicros',
      type: FieldMetadataType.NUMERIC,
      hidden: false,
      isRequired: false,
    },
    {
      name: 'currencyCode',
      type: FieldMetadataType.TEXT,
      hidden: false,
      isRequired: false,
    },
  ],
};

export type CurrencyMetadata = {
  amountMicros: number;
  currencyCode: string;
};
