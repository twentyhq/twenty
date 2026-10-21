import {
  type ConditionalDisplay,
  type UniversalConditionalDisplay,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { mapConditionalDisplayRoleIdsValue } from 'src/engine/metadata-modules/flat-conditional-display/utils/map-conditional-display-role-ids-value.util';

const resolveFieldMetadataIdOrThrow = ({
  fieldMetadataUniversalIdentifier,
  flatFieldMetadataMaps,
}: {
  fieldMetadataUniversalIdentifier: string | null;
  flatFieldMetadataMaps: MetadataFlatEntityMaps<'fieldMetadata'>;
}): string => {
  const flatFieldMetadata = isDefined(fieldMetadataUniversalIdentifier)
    ? findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: fieldMetadataUniversalIdentifier,
      })
    : undefined;

  if (!isDefined(flatFieldMetadata)) {
    throw new FlatEntityMapsException(
      `Field metadata not found for universal identifier: ${fieldMetadataUniversalIdentifier}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatFieldMetadata.id;
};

const resolveRoleIdOrThrow = ({
  roleUniversalIdentifier,
  flatRoleMaps,
}: {
  roleUniversalIdentifier: string;
  flatRoleMaps: MetadataFlatEntityMaps<'role'>;
}): string => {
  const flatRole = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatRoleMaps,
    universalIdentifier: roleUniversalIdentifier,
  });

  if (!isDefined(flatRole)) {
    throw new FlatEntityMapsException(
      `Role not found for universal identifier: ${roleUniversalIdentifier}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatRole.id;
};

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
        ...(fieldMetadataUniversalIdentifier !== undefined
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
