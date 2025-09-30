import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  type FlatFieldMetadata
} from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataSecond } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { buildDescriptionForRelationFieldMetadataOnFromField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-from-field.util';
import { buildDescriptionForRelationFieldMetadataOnToField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-to-field.util';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import {
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  STANDARD_OBJECT_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { type STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { createRelationDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';

type FlatFieldMetadataRelationWithoutRelations = Omit<
  FlatFieldMetadata<FieldMetadataType.RELATION>,
  'flatRelationTargetFieldMetadata' | 'flatRelationTargetObjectMetadata'
>;

const generateSourceFlatFieldMetadata = ({
  workspaceId,
  targetFlatObjectMetadata,
  sourceFlatObjectMetadata,
}: Omit<
  BuildDefaultRelationFieldsForCustomObjectArgs,
  'existingFlatObjectMetadataMaps'
> & {
  sourceFlatObjectMetadata: FlatObjectMetadataSecond;
  targetFlatObjectMetadata: FlatObjectMetadataSecond;
}): FlatFieldMetadataRelationWithoutRelations => {
  const { description } = buildDescriptionForRelationFieldMetadataOnFromField({
    relationObjectMetadataNamePlural: targetFlatObjectMetadata.namePlural,
    targetObjectLabelSingular: sourceFlatObjectMetadata.labelSingular,
  });

  const createdAt = new Date();
  const sourceFieldMetadataId = v4();
  const targetFieldMetadataId = v4();
  const icon =
    STANDARD_OBJECT_ICONS[
      targetFlatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECT_ICONS
    ] || 'IconBuildingSkyscraper';
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

  return {
    createdAt,
    updatedAt: createdAt,
    defaultValue: null,
    description: description,
    icon,
    id: sourceFieldMetadataId,
    isActive: true,
    isCustom: false,
    isLabelSyncedWithName: false,
    isNullable: true,
    isUIReadOnly: false,
    isSystem: true,
    isUnique: false,
    label: capitalize(targetFlatObjectMetadata.namePlural),
    name: targetFlatObjectMetadata.namePlural,
    objectMetadataId: sourceFlatObjectMetadata.id,
    options: null,
    relationTargetFieldMetadataId: targetFieldMetadataId,
    relationTargetObjectMetadataId: targetFlatObjectMetadata.id,
    settings: {
      relationType: RelationType.ONE_TO_MANY,
    },
    standardId,
    standardOverrides: null,
    type: FieldMetadataType.RELATION,
    universalIdentifier: standardId,
    workspaceId,
    morphId: null,
  };
};

const generateTargetFlatFieldMetadata = ({
  sourceFlatObjectMetadata,
  targetFlatObjectMetadata,
  sourceFlatFieldMetadata,
  workspaceId,
}: Omit<
  BuildDefaultRelationFieldsForCustomObjectArgs,
  'existingFlatObjectMetadataMaps'
> & {
  sourceFlatObjectMetadata: FlatObjectMetadataSecond;
  targetFlatObjectMetadata: FlatObjectMetadataSecond;
  sourceFlatFieldMetadata: FlatFieldMetadataRelationWithoutRelations;
}): FlatFieldMetadataRelationWithoutRelations => {
  const customStandardFieldId =
    STANDARD_OBJECT_FIELD_IDS[
      targetFlatObjectMetadata.nameSingular as (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number]
    ].custom;

  const { description } = buildDescriptionForRelationFieldMetadataOnToField({
    relationObjectMetadataNamePlural: targetFlatObjectMetadata.namePlural,
    targetObjectLabelSingular: sourceFlatObjectMetadata.labelSingular,
  });
  const createdAt = new Date();
  const standardId = createRelationDeterministicUuid({
    objectId: sourceFlatObjectMetadata.id,
    standardId: customStandardFieldId,
  });

  return {
    morphId: null,
    id: sourceFlatFieldMetadata.relationTargetFieldMetadataId,
    name: sourceFlatObjectMetadata.nameSingular,
    label: sourceFlatObjectMetadata.labelSingular,
    description,
    standardId,
    objectMetadataId: targetFlatObjectMetadata.id,
    workspaceId: workspaceId,
    isCustom: false,
    isActive: true,
    isSystem: true,
    isUIReadOnly: false,
    type: FieldMetadataType.RELATION,
    icon: 'IconBuildingSkyscraper',
    isNullable: true,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.CASCADE,
      joinColumnName: `${sourceFlatObjectMetadata.nameSingular}Id`,
    },
    createdAt,
    updatedAt: createdAt,
    defaultValue: null,
    isLabelSyncedWithName: false,
    isUnique: false,
    options: null,
    relationTargetFieldMetadataId: sourceFlatFieldMetadata.id,
    relationTargetObjectMetadataId: sourceFlatObjectMetadata.id,
    standardOverrides: null,
    universalIdentifier: standardId,
  };
};

const DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS = [
  'timelineActivity',
  'favorite',
  'attachment',
  'noteTarget',
  'taskTarget',
] as const satisfies (keyof typeof STANDARD_OBJECT_IDS)[];

export type BuildDefaultRelationFieldsForCustomObjectArgs = {
  existingFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadataSecond>;
  workspaceId: string;
  sourceFlatObjectMetadata: FlatObjectMetadataSecond;
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
  existingFlatObjectMetadataMaps,
  sourceFlatObjectMetadata,
  workspaceId,
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

  return DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.reduce(
    (sourceAndTargetFlatFieldMetadatasRecord, objectMetadataNameSingular) => {
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

      const sourceFlatFieldMetadata = generateSourceFlatFieldMetadata({
        sourceFlatObjectMetadata,
        targetFlatObjectMetadata: targetFlatObjectMetadata,
        workspaceId,
      });

      const targetFlatFieldMetadata = generateTargetFlatFieldMetadata({
        sourceFlatFieldMetadata,
        sourceFlatObjectMetadata,
        targetFlatObjectMetadata,
        workspaceId,
      });

      return {
        standardSourceFlatFieldMetadatas: [
          ...sourceAndTargetFlatFieldMetadatasRecord.standardSourceFlatFieldMetadatas,
          {
            ...sourceFlatFieldMetadata,
            flatRelationTargetFieldMetadata: {
              ...targetFlatFieldMetadata,
              flatRelationTargetFieldMetadata: null,
              flatRelationTargetObjectMetadata: null,
            },
            flatRelationTargetObjectMetadata: targetFlatObjectMetadata,
          },
        ],
        standardTargetFlatFieldMetadatas: [
          ...sourceAndTargetFlatFieldMetadatasRecord.standardTargetFlatFieldMetadatas,
          {
            ...targetFlatFieldMetadata,
            flatRelationTargetFieldMetadata: {
              ...sourceFlatFieldMetadata,
              flatRelationTargetFieldMetadata: null,
              flatRelationTargetObjectMetadata: null,
            },
            flatRelationTargetObjectMetadata: sourceFlatObjectMetadata,
          },
        ],
      };
    },
    EMPTY_SOURCE_AND_TARGET_FLAT_FIELD_METADATAS_RECORD,
  );
};
