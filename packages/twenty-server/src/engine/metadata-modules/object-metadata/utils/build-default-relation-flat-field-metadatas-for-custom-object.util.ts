import { type STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import {
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';

const DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  'timelineActivity',
  'favorite',
  'attachment',
  'noteTarget',
  'taskTarget',
] as const satisfies (keyof typeof STANDARD_OBJECT_IDS)[];

const morphIdByRelationObjectNameSingular = {
  timelineActivity: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId,
  favorite: null,
  attachment: null,
  noteTarget: null,
  taskTarget: null,
} satisfies Record<
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number],
  string | null
>;

// TODO: once we have finished migrating, we can delete custom code
// once we migrate timeline activity to morph relations, we can add it.
// another way to check if an object is migrated to morph relations is to check if the feature flag is enabled
const DEFAULT_MORPH_RELATIONS_OBJECTS_STANDARD_IDS =
  [] as const satisfies (keyof typeof STANDARD_OBJECT_IDS)[];

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
        const isObjectMigratedFromOlderReleases =
          DEFAULT_MORPH_RELATIONS_OBJECTS_STANDARD_IDS.map(toString).includes(
            objectMetadataNameSingular,
          );
        const isFeatureFlagEnabled =
          (objectMetadataNameSingular === 'timelineActivity' &&
            existingFeatureFlagsMap[
              FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED
            ]) ??
          false;
        const isObjectMigratedToMorphRelations =
          isObjectMigratedFromOlderReleases || isFeatureFlagEnabled;

        const targetFlatObjectMetadataId =
          objectIdByNameSingular[objectMetadataNameSingular];

        if (!isDefined(targetFlatObjectMetadataId)) {
          throw new ObjectMetadataException(
            `Standard target object metadata id ${targetFlatObjectMetadataId} not found in cache`,
            ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
          );
        }

        const targetFlatObjectMetadata =
          findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityMaps: existingFlatObjectMetadataMaps,
            flatEntityId: targetFlatObjectMetadataId,
          });

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
        const fieldName = isObjectMigratedToMorphRelations
          ? morphFieldName
          : sourceFlatObjectMetadata.nameSingular;
        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: fieldName,
        });

        const morphId =
          morphIdByRelationObjectNameSingular[objectMetadataNameSingular];

        const { flatFieldMetadatas } =
          generateMorphOrRelationFlatFieldMetadataPair({
            sourceFlatObjectMetadata,
            targetFlatObjectMetadata,
            targetFlatFieldMetadataType: isObjectMigratedToMorphRelations
              ? FieldMetadataType.MORPH_RELATION
              : FieldMetadataType.RELATION,
            workspaceId,
            workspaceCustomApplicationId,
            sourceFlatObjectMetadataJoinColumnName: joinColumnName,
            morphId,
            targetFieldName: fieldName,
            createFieldInput: {
              icon: 'IconBuildingSkyscraper',
              type: FieldMetadataType.RELATION,
              name: targetFlatObjectMetadata.namePlural,
              label: capitalize(targetFlatObjectMetadata.labelPlural),
              objectMetadataId: sourceFlatObjectMetadata.id,
              standardId,
              isSystem: true,
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

  return result;
};
