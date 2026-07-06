import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-field-universal-identifier.util';

export const STANDARD_OBJECT_SYSTEM_FIELD_NAMES = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
  'searchVector',
] as const;

type StandardObjectSystemFieldName =
  (typeof STANDARD_OBJECT_SYSTEM_FIELD_NAMES)[number];

// System field universal identifiers are deterministically derived from the
// standard application universal identifier, the object universal identifier
// and the field name. Renaming a system field therefore changes its
// universal identifier and must never happen without a coordinated backfill
// of existing workspaces.
export const buildStandardObjectSystemFields = (
  objectUniversalIdentifier: string,
): Record<StandardObjectSystemFieldName, { universalIdentifier: string }> =>
  Object.fromEntries(
    STANDARD_OBJECT_SYSTEM_FIELD_NAMES.map((fieldName) => [
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
  ) as Record<StandardObjectSystemFieldName, { universalIdentifier: string }>;
