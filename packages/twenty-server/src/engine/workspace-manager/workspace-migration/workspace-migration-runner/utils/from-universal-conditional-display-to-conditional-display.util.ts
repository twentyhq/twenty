import {
  type ConditionalDisplay,
  type UniversalConditionalDisplay,
} from 'twenty-shared/types';
import { isUndefined } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { mapConditionalDisplayRoleIdsValue } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-conditional-display-role-ids-value.util';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { resolveFieldMetadataIdOrThrow } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/resolve-field-metadata-id-or-throw.util';
import { resolveRoleIdOrThrow } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/resolve-role-id-or-throw.util';

export const fromUniversalConditionalDisplayToConditionalDisplay = ({
  universalConditionalDisplay,
  flatFieldMetadataMaps,
  flatRoleMaps,
}: {
  universalConditionalDisplay: UniversalConditionalDisplay | null;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): ConditionalDisplay | null => {
  if (!isDefined(universalConditionalDisplay)) {
    return null;
  }

  return {
    ...universalConditionalDisplay,
    recordFilters: universalConditionalDisplay.recordFilters?.map(
      ({
        fieldMetadataUniversalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier,
        ...rest
      }) => ({
        ...rest,
        ...(rest.contextKey === 'currentRoleId'
          ? {
              value: mapConditionalDisplayRoleIdsValue({
                value: rest.value,
                mapRoleId: (roleUniversalIdentifier) =>
                  resolveRoleIdOrThrow({
                    roleUniversalIdentifier,
                    flatRoleMaps,
                  }),
              }),
            }
          : {}),
        ...(!isUndefined(fieldMetadataUniversalIdentifier)
          ? {
              fieldMetadataId: resolveFieldMetadataIdOrThrow({
                fieldMetadataUniversalIdentifier,
                flatFieldMetadataMaps,
              }),
            }
          : {}),
        ...(isDefined(relationTargetFieldMetadataUniversalIdentifier)
          ? {
              relationTargetFieldMetadataId: resolveFieldMetadataIdOrThrow({
                fieldMetadataUniversalIdentifier:
                  relationTargetFieldMetadataUniversalIdentifier,
                flatFieldMetadataMaps,
              }),
            }
          : {}),
      }),
    ),
  };
};
