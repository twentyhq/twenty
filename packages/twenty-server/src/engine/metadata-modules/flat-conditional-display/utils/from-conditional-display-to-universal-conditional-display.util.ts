import {
  type ConditionalDisplay,
  type UniversalConditionalDisplay,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { mapConditionalDisplayRoleIdsValue } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-conditional-display-role-ids-value.util';

export const fromConditionalDisplayToUniversalConditionalDisplay = ({
  conditionalDisplay,
  fieldMetadataUniversalIdentifierById,
  roleUniversalIdentifierById,
}: {
  conditionalDisplay: ConditionalDisplay | null;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
  roleUniversalIdentifierById: Partial<Record<string, string>>;
}): UniversalConditionalDisplay | null => {
  if (!isDefined(conditionalDisplay)) {
    return null;
  }

  return {
    ...conditionalDisplay,
    recordFilters: conditionalDisplay.recordFilters?.map(
      ({ fieldMetadataId, relationTargetFieldMetadataId, ...rest }) => ({
        ...rest,
        ...(rest.contextKey === 'currentRoleId'
          ? {
              value: mapConditionalDisplayRoleIdsValue({
                value: rest.value,
                mapRoleId: (roleId) =>
                  roleUniversalIdentifierById[roleId] ?? roleId,
              }),
            }
          : {}),
        ...(isDefined(fieldMetadataId)
          ? {
              fieldMetadataUniversalIdentifier:
                fieldMetadataUniversalIdentifierById[fieldMetadataId] ?? null,
            }
          : {}),
        ...(isDefined(relationTargetFieldMetadataId)
          ? {
              relationTargetFieldMetadataUniversalIdentifier:
                fieldMetadataUniversalIdentifierById[
                  relationTargetFieldMetadataId
                ] ?? null,
            }
          : {}),
      }),
    ),
  };
};
