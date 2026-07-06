import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-field-universal-identifier.util';

// System field universal identifiers (id, name, createdAt, updatedAt,
// deletedAt, createdBy, updatedBy, position, searchVector) are
// deterministically derived from the standard application universal
// identifier, the object universal identifier and the field name.
// Renaming a system field therefore changes its universal identifier and
// must never happen without a coordinated backfill of existing workspaces.
export const buildStandardObjectSystemFields = <
  const T extends readonly string[],
>(
  objectUniversalIdentifier: string,
  fieldNames: T,
): { [FieldName in T[number]]: { universalIdentifier: string } } =>
  Object.fromEntries(
    fieldNames.map((fieldName) => [
      fieldName,
      {
        universalIdentifier: getFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier,
          name: fieldName,
        }),
      },
    ]),
  ) as { [FieldName in T[number]]: { universalIdentifier: string } };
