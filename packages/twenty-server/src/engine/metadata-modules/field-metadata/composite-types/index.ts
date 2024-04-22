import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { currencyFields } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { fullNameFields } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { linkFields } from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { addressFields } from 'src/engine/metadata-modules/field-metadata/composite-types/address.composite-type';

export type CompositeFieldsDefinitionFunction = (
  fieldMetadata?: FieldMetadataInterface,
) => FieldMetadataInterface[];

export const compositeDefinitions = new Map<
  string,
  CompositeFieldsDefinitionFunction
>([
  [FieldMetadataType.LINK, linkFields],
  [FieldMetadataType.CURRENCY, currencyFields],
  [FieldMetadataType.FULL_NAME, fullNameFields],
  [FieldMetadataType.ADDRESS, addressFields],
]);
