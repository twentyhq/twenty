import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { currencyFields } from 'src/metadata/field-metadata/composite-types/currency.composite-type';
import { fullNameFields } from 'src/metadata/field-metadata/composite-types/full-name.composite-type';
import { linkFields } from 'src/metadata/field-metadata/composite-types/link.composite-type';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

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
]);
