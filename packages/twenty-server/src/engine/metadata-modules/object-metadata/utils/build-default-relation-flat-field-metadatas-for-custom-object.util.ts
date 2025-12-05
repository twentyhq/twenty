import { type STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, CustomError, isDefined } from 'twenty-shared/utils';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { STANDARD_OBJECTS } from 'src/engine/core-modules/application/constants/standard-object.constant';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';

const DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  'timelineActivity',
  'favorite',
  'attachment',
  'noteTarget',
  'taskTarget',
] as const satisfies (keyof typeof STANDARD_OBJECT_IDS)[];

// once we migrate timeline activity to morph relations, we can add it.
const DEFAULT_MORPH_RELATIONS_OBJECTS_STANDARD_IDS = [
  'timelineActivity',
] as const satisfies (keyof typeof STANDARD_OBJECT_IDS)[];

export type BuildDefaultRelationFieldsForCustomObjectArgs = {
  existingFeatureFlagsMap: FeatureFlagMap;
  existingFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  workspaceId: string;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  workspaceCustomApplicationId: string;
};

type SourceAndTargetFlatFieldMetadatasRecord = {
  standardSourceFlatFieldMetadatas: FlatFieldMetadata[];
  standardTargetFlatFieldMetadatas: FlatFieldMetadata[];
};
const EMPTY_SOURCE_AND_TARGET_FLAT_FIELD_METADATAS_RECORD: SourceAndTargetFlatFieldMetadatasRecord =
  {
    standardSourceFlatFieldMetadatas: [],
    standardTargetFlatFieldMetadatas: [],
  };

export const buildDefaultRelationFlatFieldMetadatasForCustomObject = ({
  existingFeatureFlagsMap,
  existingFlatObjectMetadataMaps,
  sourceFlatObjectMetadata,
  workspaceId,
  workspaceCustomApplicationId,
}: BuildDefaultRelationFieldsForCustomObjectArgs): SourceAndTargetFlatFieldMetadatasRecord => {
  const isTimelineActivityMorphMigrated =
    existingFeatureFlagsMap[FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED] ??
    false;

  const objectIdByNameSingular = Object.values(
    existingFlatObjectMetadataMaps.byId,
  ).reduce<Record<string, string>>((acc, flatObject) => {
    if (!isDefined(flatObject)) {
      return acc;
    }

    return {
      ...acc,
      [flatObject.nameSingular]: flatObject.id,
    };
  }, {});

  const result =
    DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.reduce<SourceAndTargetFlatFieldMetadatasRecord>(
      (sourceAndTargetFlatFieldMetadatasRecord, objectMetadataNameSingular) => {
        if (
          objectMetadataNameSingular === 'timelineActivity' &&
          isTimelineActivityMorphMigrated
        ) {
          return sourceAndTargetFlatFieldMetadatasRecord;
        }

        const targetFlatObjectMetadataId =
          objectIdByNameSingular[objectMetadataNameSingular];

        if (!isDefined(targetFlatObjectMetadataId)) {
          throw new ObjectMetadataException(
            `Standard target object metadata id ${targetFlatObjectMetadataId} not found in cache`,
            ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: existingFlatObjectMetadataMaps,
          flatEntityId: targetFlatObjectMetadataId,
        });

        if (!isDefined(targetFlatObjectMetadata)) {
          throw new ObjectMetadataException(
            `Standard target object metadata of id ${targetFlatObjectMetadataId} not found in cache`,
            ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const standardId =
          CUSTOM_OBJECT_STANDARD_FIELD_IDS[
            targetFlatObjectMetadata.namePlural as keyof typeof CUSTOM_OBJECT_STANDARD_FIELD_IDS
          ];

        if (!isDefined(standardId)) {
          throw new ObjectMetadataException(
            `Standard field ID not found for target object ${targetFlatObjectMetadata.namePlural}`,
            ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const icon =
          STANDARD_OBJECT_ICONS[
            targetFlatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECT_ICONS
          ] || 'IconBuildingSkyscraper';

        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: sourceFlatObjectMetadata.nameSingular,
        });

        const { flatFieldMetadatas } =
          generateMorphOrRelationFlatFieldMetadataPair({
            sourceFlatObjectMetadata,
            targetFlatObjectMetadata,
            sourceFlatFieldMetadataType: FieldMetadataType.RELATION,
            targetFlatFieldMetadataType: FieldMetadataType.RELATION,
            workspaceId,
            workspaceCustomApplicationId,
            sourceFlatObjectMetadataJoinColumnName: joinColumnName,
            targetFieldName: sourceFlatObjectMetadata.nameSingular,
            createFieldInput: {
              isCustom: false,
              isSystem: true,
              isUnique: false,
              icon: 'IconBuildingSkyscraper',
              type: FieldMetadataType.RELATION,
              name: targetFlatObjectMetadata.nameSingular,
              label: capitalize(targetFlatObjectMetadata.labelSingular),
              objectMetadataId: sourceFlatObjectMetadata.id,
              standardId,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId: targetFlatObjectMetadata.id,
                targetFieldLabel: capitalize(
                  sourceFlatObjectMetadata.nameSingular,
                ),
                targetFieldIcon: icon,
              },
            },
          });

        return {
          standardSourceFlatFieldMetadatas: [
            ...sourceAndTargetFlatFieldMetadatasRecord.standardSourceFlatFieldMetadatas,
            flatFieldMetadatas[0],
          ],
          standardTargetFlatFieldMetadatas: [
            ...sourceAndTargetFlatFieldMetadatasRecord.standardTargetFlatFieldMetadatas,
            flatFieldMetadatas[1],
          ],
        };
      },
      EMPTY_SOURCE_AND_TARGET_FLAT_FIELD_METADATAS_RECORD,
    );

  const resultForMigratedToMorphRelations =
    DEFAULT_MORPH_RELATIONS_OBJECTS_STANDARD_IDS.reduce<SourceAndTargetFlatFieldMetadatasRecord>(
      (sourceAndTargetFlatFieldMetadatasRecord, objectMetadataNameSingular) => {
        if (
          objectMetadataNameSingular === 'timelineActivity' &&
          !isTimelineActivityMorphMigrated
        ) {
          return sourceAndTargetFlatFieldMetadatasRecord;
        }

        const targetFlatObjectMetadataId =
          objectIdByNameSingular[objectMetadataNameSingular];

        if (!isDefined(targetFlatObjectMetadataId)) {
          throw new ObjectMetadataException(
            `Standard target object metadata id ${targetFlatObjectMetadataId} not found in cache`,
            ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: existingFlatObjectMetadataMaps,
          flatEntityId: targetFlatObjectMetadataId,
        });

        if (!isDefined(targetFlatObjectMetadata)) {
          throw new ObjectMetadataException(
            `Standard target object metadata of id ${targetFlatObjectMetadataId} not found in cache`,
            ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const standardId =
          CUSTOM_OBJECT_STANDARD_FIELD_IDS[
            targetFlatObjectMetadata.namePlural as keyof typeof CUSTOM_OBJECT_STANDARD_FIELD_IDS
          ];

        if (!isDefined(standardId)) {
          throw new ObjectMetadataException(
            `Standard field ID not found for target object ${targetFlatObjectMetadata.namePlural}`,
            ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const icon =
          STANDARD_OBJECT_ICONS[
            targetFlatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECT_ICONS
          ] || 'IconBuildingSkyscraper';

        const morphFieldName = `target${capitalize(sourceFlatObjectMetadata.nameSingular)}`;
        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: morphFieldName,
        });

        const morphId = getMorphIdForObjectStandard(objectMetadataNameSingular);

        const { flatFieldMetadatas } =
          generateMorphOrRelationFlatFieldMetadataPair({
            sourceFlatObjectMetadata,
            targetFlatObjectMetadata,
            sourceFlatFieldMetadataType: FieldMetadataType.RELATION,
            targetFlatFieldMetadataType: FieldMetadataType.MORPH_RELATION,
            workspaceId,
            workspaceCustomApplicationId,
            sourceFlatObjectMetadataJoinColumnName: joinColumnName,
            morphId,
            targetFieldName: morphFieldName,
            createFieldInput: {
              isCustom: false,
              isSystem: true,
              isUnique: false,
              icon: 'IconBuildingSkyscraper',
              type: FieldMetadataType.RELATION,
              name: targetFlatObjectMetadata.nameSingular,
              label: capitalize(targetFlatObjectMetadata.labelSingular),
              objectMetadataId: sourceFlatObjectMetadata.id,
              standardId,
              relationCreationPayload: {
                type: RelationType.ONE_TO_MANY,
                targetObjectMetadataId: targetFlatObjectMetadata.id,
                targetFieldLabel: capitalize(
                  sourceFlatObjectMetadata.nameSingular,
                ),
                targetFieldIcon: icon,
              },
            },
          });

        return {
          standardSourceFlatFieldMetadatas: [
            ...sourceAndTargetFlatFieldMetadatasRecord.standardSourceFlatFieldMetadatas,
            flatFieldMetadatas[0],
          ],
          standardTargetFlatFieldMetadatas: [
            ...sourceAndTargetFlatFieldMetadatasRecord.standardTargetFlatFieldMetadatas,
            flatFieldMetadatas[1],
          ],
        };
      },
      EMPTY_SOURCE_AND_TARGET_FLAT_FIELD_METADATAS_RECORD,
    );

  return {
    standardSourceFlatFieldMetadatas: [
      ...result.standardSourceFlatFieldMetadatas,
      ...resultForMigratedToMorphRelations.standardSourceFlatFieldMetadatas,
    ],
    standardTargetFlatFieldMetadatas: [
      ...result.standardTargetFlatFieldMetadatas,
      ...resultForMigratedToMorphRelations.standardTargetFlatFieldMetadatas,
    ],
  };
};

const getMorphIdForObjectStandard = (targetFlatObjectMetadata: string) => {
  if (
    !DEFAULT_MORPH_RELATIONS_OBJECTS_STANDARD_IDS.map((name) =>
      name.toString(),
    ).includes(targetFlatObjectMetadata)
  ) {
    throw new CustomError(
      'Target morph id not found for object',
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }

  const fields =
    STANDARD_OBJECTS[targetFlatObjectMetadata as keyof typeof STANDARD_OBJECTS]
      .fields;

  if (
    typeof fields === 'object' &&
    fields !== null &&
    'targetMorphId' in fields &&
    isDefined((fields as Record<string, unknown>).targetMorphId)
  ) {
    return fields.targetMorphId.universalIdentifier;
  }

  throw new CustomError(
    'Target morph id not found for object',
    FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
  );
};
