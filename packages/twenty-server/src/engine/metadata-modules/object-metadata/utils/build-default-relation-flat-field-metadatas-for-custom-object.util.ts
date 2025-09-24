import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { buildDescriptionForRelationFieldMetadataOnFromField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-from-field.util';
import { buildDescriptionForRelationFieldMetadataOnToField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-to-field.util';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { fromFlatObjectMetadataToFlatObjectMetadataWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/from-flat-object-metadata-to-flat-object-metadata-without-fields.util';
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
  sourceFlatObjectMetadata: FlatObjectMetadata;
  targetFlatObjectMetadata: FlatObjectMetadata;
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
  sourceFlatObjectMetadata: FlatObjectMetadata;
  targetFlatObjectMetadata: FlatObjectMetadata;
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
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  workspaceId: string;
  sourceFlatObjectMetadata: FlatObjectMetadata;
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
  return DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.reduce(
    (sourceAndTargetFlatFieldMetadatasRecord, objectMetadataNameSingular) => {
      const targetFlatObjectMetadataId =
        existingFlatObjectMetadataMaps.idByNameSingular[
          objectMetadataNameSingular
        ];

      if (!isDefined(targetFlatObjectMetadataId)) {
        throw new ObjectMetadataException(
          `Standard target object metadata id ${targetFlatObjectMetadataId} not found in cache`,
          ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      const targetFlatObjectMetadata =
        findFlatObjectMetadataInFlatObjectMetadataMaps({
          flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
          objectMetadataId: targetFlatObjectMetadataId,
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
            flatRelationTargetObjectMetadata:
              fromFlatObjectMetadataToFlatObjectMetadataWithoutFields(
                targetFlatObjectMetadata,
              ),
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
            flatRelationTargetObjectMetadata:
              fromFlatObjectMetadataToFlatObjectMetadataWithoutFields(
                sourceFlatObjectMetadata,
              ),
          },
        ],
      };
    },
    EMPTY_SOURCE_AND_TARGET_FLAT_FIELD_METADATAS_RECORD,
  );
};
