import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';
import { getSubfieldsForAggregateOperation } from 'src/engine/twenty-orm/utils/get-subfields-for-aggregate-operation.util';

// Returns the physical columns whose emptiness determines whether the field is
// empty, or null for types where emptiness is not meaningful (relations,
// booleans, system-managed types)
export const getEmptinessColumnNamesForField = (
  flatFieldMetadata: Pick<FlatFieldMetadata, 'name' | 'type'>,
): string[] | null => {
  switch (flatFieldMetadata.type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.DATE:
    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.RATING:
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.RAW_JSON:
    case FieldMetadataType.FILES:
      return [flatFieldMetadata.name];
    // Currency codes and phone country/calling codes often carry workspace
    // defaults, which would mask emptiness of the value users actually fill in
    case FieldMetadataType.CURRENCY:
      return formatColumnNamesFromCompositeFieldAndSubfields(
        flatFieldMetadata.name,
        ['amountMicros'],
      );
    case FieldMetadataType.PHONES:
      return formatColumnNamesFromCompositeFieldAndSubfields(
        flatFieldMetadata.name,
        ['primaryPhoneNumber'],
      );
    case FieldMetadataType.FULL_NAME:
    case FieldMetadataType.ADDRESS:
    case FieldMetadataType.LINKS:
    case FieldMetadataType.EMAILS:
    case FieldMetadataType.RICH_TEXT:
      return formatColumnNamesFromCompositeFieldAndSubfields(
        flatFieldMetadata.name,
        getSubfieldsForAggregateOperation(flatFieldMetadata.type),
      );
    case FieldMetadataType.ACTOR:
    case FieldMetadataType.BOOLEAN:
    case FieldMetadataType.MORPH_RELATION:
    case FieldMetadataType.POSITION:
    case FieldMetadataType.RELATION:
    case FieldMetadataType.TS_VECTOR:
    case FieldMetadataType.UUID:
      return null;
    default:
      return assertUnreachable(flatFieldMetadata.type);
  }
};
