import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

type ComputeFieldMetadataRelationSettingsForRelationTypeArgs = {
  relationType: RelationType;
  joinColumnName: string;
};
const computeFieldMetadataRelationSettingsForRelationType = ({
  relationType,
  joinColumnName,
}: ComputeFieldMetadataRelationSettingsForRelationTypeArgs) => {
  if (relationType === RelationType.MANY_TO_ONE) {
    return {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
      joinColumnName,
    };
  }

  return {
    relationType: RelationType.ONE_TO_MANY,
  };
};

type GenerateMorphOrRelationFlatFieldMetadataPairArgs = {
  targetFlatObjectMetadata: FlatObjectMetadata;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  sourceFlatObjectMetadataJoinColumnName: string;
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'> &
    Required<
      Pick<CreateFieldInput, 'relationCreationPayload' | 'type' | 'name'>
    > & { type: MorphOrRelationFieldMetadataType };
  workspaceId: string;
  morphId?: string | null;
};

export type SourceTargetMorphOrRelationFlatFieldAndFlatIndex = {
  flatFieldMetadatas: FlatFieldMetadata[];
  indexMetadatas: FlatIndexMetadata[];
};

export const generateMorphOrRelationFlatFieldMetadataPair = ({
  createFieldInput,
  sourceFlatObjectMetadata,
  targetFlatObjectMetadata,
  workspaceId,
  sourceFlatObjectMetadataJoinColumnName,
  morphId = null,
}: GenerateMorphOrRelationFlatFieldMetadataPairArgs): SourceTargetMorphOrRelationFlatFieldAndFlatIndex => {
  const { relationCreationPayload } = createFieldInput;

  const sourceFlatFieldMetadataSettings =
    computeFieldMetadataRelationSettingsForRelationType({
      joinColumnName: sourceFlatObjectMetadataJoinColumnName,
      relationType: relationCreationPayload.type,
    });
  const targetRelationTargetFieldMetadataId = v4();
  const sourceRelationTargetFieldMetadataId = v4();
  const sourceFlatFieldMetadata: Omit<
    FlatFieldMetadata<MorphOrRelationFieldMetadataType>,
    'flatRelationTargetFieldMetadata'
  > = {
    ...getDefaultFlatFieldMetadata({
      createFieldInput,
      workspaceId,
      fieldMetadataId: sourceRelationTargetFieldMetadataId,
    }),
    morphId,
    objectMetadataId: sourceFlatObjectMetadata.id,
    icon: createFieldInput.icon ?? 'IconRelationOneToMany',
    type: createFieldInput.type,
    defaultValue: null,
    settings: sourceFlatFieldMetadataSettings,
    options: null,
    relationTargetFieldMetadataId: targetRelationTargetFieldMetadataId,
    relationTargetObjectMetadataId: targetFlatObjectMetadata.id,
    flatRelationTargetObjectMetadata: targetFlatObjectMetadata,
  };

  const targetCreateFieldInput: CreateFieldInput = {
    icon: relationCreationPayload.targetFieldIcon ?? 'Icon123',
    label: relationCreationPayload.targetFieldLabel,
    name: computeMetadataNameFromLabel(
      relationCreationPayload.targetFieldLabel,
    ),
    objectMetadataId: targetFlatObjectMetadata.id,
    type: FieldMetadataType.RELATION,
    workspaceId,
  };
  const targetFlatFieldMetadataSettings =
    computeFieldMetadataRelationSettingsForRelationType({
      joinColumnName: computeMorphOrRelationFieldJoinColumnName({
        name: targetCreateFieldInput.name,
      }),
      relationType:
        relationCreationPayload.type === RelationType.ONE_TO_MANY
          ? RelationType.MANY_TO_ONE
          : RelationType.ONE_TO_MANY,
    });
  const targetFlatFieldMetadata: FlatFieldMetadata<FieldMetadataType.RELATION> =
    {
      ...getDefaultFlatFieldMetadata({
        createFieldInput: targetCreateFieldInput,
        workspaceId,
        fieldMetadataId: targetRelationTargetFieldMetadataId,
      }),
      type: FieldMetadataType.RELATION,
      defaultValue: null,
      settings: targetFlatFieldMetadataSettings,
      options: null,
      relationTargetFieldMetadataId: sourceRelationTargetFieldMetadataId,
      relationTargetObjectMetadataId: sourceFlatObjectMetadata.id,
      flatRelationTargetFieldMetadata: sourceFlatFieldMetadata,
      flatRelationTargetObjectMetadata: sourceFlatObjectMetadata,
    };

  const indexId = v4();
  const createdAt = new Date();
  const indexMetadata: FlatIndexMetadata =
    generateFlatIndexMetadataWithNameOrThrow({
      flatIndex: {
        createdAt,
        flatIndexFieldMetadatas: [
          {
            createdAt,
            fieldMetadataId:
              relationCreationPayload.type === RelationType.MANY_TO_ONE
                ? sourceFlatFieldMetadata.id
                : targetFlatFieldMetadata.id,
            id: v4(),
            indexMetadataId: indexId,
            order: 0,
            updatedAt: createdAt,
          },
        ],
        id: indexId,
        indexType: IndexType.BTREE,
        indexWhereClause: null,
        isCustom: true,
        isUnique: false,
        objectMetadataId:
          relationCreationPayload.type === RelationType.MANY_TO_ONE
            ? sourceFlatObjectMetadata.id
            : targetFlatObjectMetadata.id,
        universalIdentifier: indexId,
        updatedAt: createdAt,
        workspaceId,
      },
      flatObjectMetadata: (relationCreationPayload.type ===
      RelationType.MANY_TO_ONE
        ? {
            ...sourceFlatObjectMetadata,
            flatFieldMetadatas: [
              ...sourceFlatObjectMetadata.flatFieldMetadatas,
              sourceFlatFieldMetadata,
            ],
          }
        : {
            ...targetFlatObjectMetadata,
            flatFieldMetadatas: [
              ...targetFlatObjectMetadata.flatFieldMetadatas,
              targetFlatFieldMetadata,
            ],
          }) as FlatObjectMetadata,
    });

  return {
    flatFieldMetadatas: [
      {
        ...sourceFlatFieldMetadata,
        flatRelationTargetFieldMetadata: targetFlatFieldMetadata,
      },
      targetFlatFieldMetadata,
    ],
    indexMetadatas: [indexMetadata],
  };
};
