import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Composite properties that carry workspace defaults (currency codes, phone
// country/calling codes): a stamped default would mask emptiness of the value
// users actually fill in
const DEFAULT_BEARING_COMPOSITE_PROPERTIES: Partial<
  Record<FieldMetadataType, string[]>
> = {
  [FieldMetadataType.CURRENCY]: ['currencyCode'],
  [FieldMetadataType.PHONES]: [
    'primaryPhoneCountryCode',
    'primaryPhoneCallingCode',
  ],
};

const getCompositeEmptinessColumnNames = (
  flatFieldMetadata: Pick<FlatFieldMetadata, 'name' | 'type'>,
): string[] | null => {
  const compositeType = compositeTypeDefinitions.get(flatFieldMetadata.type);

  if (!isDefined(compositeType)) {
    return null;
  }

  const defaultBearingProperties =
    DEFAULT_BEARING_COMPOSITE_PROPERTIES[flatFieldMetadata.type] ?? [];

  return compositeType.properties
    .filter((property) => !defaultBearingProperties.includes(property.name))
    .map((property) =>
      computeCompositeColumnName(flatFieldMetadata.name, property),
    );
};

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
    case FieldMetadataType.CURRENCY:
    case FieldMetadataType.PHONES:
    case FieldMetadataType.FULL_NAME:
    case FieldMetadataType.ADDRESS:
    case FieldMetadataType.LINKS:
    case FieldMetadataType.EMAILS:
    case FieldMetadataType.RICH_TEXT:
      return getCompositeEmptinessColumnNames(flatFieldMetadata);
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
