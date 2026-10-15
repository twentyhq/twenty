import {
  assertIsDefinedOrThrow,
  isDefined,
  isMorphRelationHead,
  pickMorphGroupSurvivorOrThrow,
} from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

type MorphRelationFieldMetadata = Pick<
  FieldMetadataEntity,
  | 'id'
  | 'type'
  | 'universalIdentifier'
  | 'morphId'
  | 'isActive'
  | 'isSystem'
  | 'overrides'
  | 'applicationId'
>;

export const buildResolveMorphRelationPermissionFieldIds = ({
  morphRelationFieldMetadatas,
  applicationUniversalIdentifierById,
  isMorphRelationHeadEnabled,
}: {
  morphRelationFieldMetadatas: MorphRelationFieldMetadata[];
  applicationUniversalIdentifierById: Map<string, string>;
  isMorphRelationHeadEnabled: boolean;
}): {
  isMorphRelationHeadFieldId: (fieldMetadataId: string) => boolean;
  resolveMorphRelationPermissionFieldIds: (fieldMetadataId: string) => string[];
} => {
  const morphIdByHeadId = new Map<string, string>();
  const targetsByMorphId = new Map<string, MorphRelationFieldMetadata[]>();

  for (const morphRelationFieldMetadata of morphRelationFieldMetadatas) {
    const { id, morphId } = morphRelationFieldMetadata;

    if (!isDefined(morphId)) {
      continue;
    }

    if (isMorphRelationHead(morphRelationFieldMetadata)) {
      morphIdByHeadId.set(id, morphId);
      continue;
    }

    targetsByMorphId.set(morphId, [
      ...(targetsByMorphId.get(morphId) ?? []),
      morphRelationFieldMetadata,
    ]);
  }

  const morphIdsWithHead = new Set(morphIdByHeadId.values());
  const representativeTargetIds = new Set(
    [...targetsByMorphId]
      .filter(([morphId]) => morphIdsWithHead.has(morphId))
      .map(
        ([, targets]) =>
          pickMorphGroupSurvivorOrThrow(
            targets.map((target) => {
              const applicationUniversalIdentifier =
                applicationUniversalIdentifierById.get(target.applicationId);

              assertIsDefinedOrThrow(
                applicationUniversalIdentifier,
                new PermissionsException(
                  `Application ${target.applicationId} of morph relation field ${target.id} not found`,
                  PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
                ),
              );

              return {
                id: target.id,
                isSystem: target.isSystem,
                isActive: resolveEffectiveFlatEntityProperty({
                  metadataName: 'fieldMetadata',
                  flatEntity: { ...target, applicationUniversalIdentifier },
                  property: 'isActive',
                }),
              };
            }),
          ).id,
      ),
  );

  return {
    isMorphRelationHeadFieldId: (fieldMetadataId) =>
      morphIdByHeadId.has(fieldMetadataId),
    resolveMorphRelationPermissionFieldIds: (fieldMetadataId) => {
      const headMorphId = morphIdByHeadId.get(fieldMetadataId);

      if (!isMorphRelationHeadEnabled && isDefined(headMorphId)) {
        return [];
      }

      if (!isMorphRelationHeadEnabled) {
        return [fieldMetadataId];
      }

      if (representativeTargetIds.has(fieldMetadataId)) {
        return [];
      }

      if (isDefined(headMorphId)) {
        return [
          fieldMetadataId,
          ...(targetsByMorphId.get(headMorphId) ?? []).map(({ id }) => id),
        ];
      }

      return [fieldMetadataId];
    },
  };
};
