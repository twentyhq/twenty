import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { currencyFields } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { fullNameFields } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { linkFields } from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

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

export function getCompositeFieldMetadataCollection(
  fieldMetadata: FieldMetadataInterface,
): FieldMetadataInterface[];
export function getCompositeFieldMetadataCollection(
  type: FieldMetadataType,
): FieldMetadataInterface[];
export function getCompositeFieldMetadataCollection(
  fieldMetadataOrType: FieldMetadataInterface | FieldMetadataType,
): FieldMetadataInterface[] {
  const type =
    typeof fieldMetadataOrType === 'string'
      ? fieldMetadataOrType
      : fieldMetadataOrType.type;
  const fieldMetadata =
    typeof fieldMetadataOrType !== 'string' ? fieldMetadataOrType : undefined;

  const compositeDefinition = compositeDefinitions.get(type);

  if (!compositeDefinition) {
    throw new Error(`Composite definition not found for type ${type}`);
  }

  return compositeDefinition(fieldMetadata);
}
