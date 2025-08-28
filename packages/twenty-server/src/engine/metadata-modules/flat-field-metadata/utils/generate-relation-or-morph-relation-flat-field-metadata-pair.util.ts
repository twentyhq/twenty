import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type RelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

type ComputeFieldMetadataRelationSettingsForRelationTypeArgs = {
  relationType: RelationType;
  fieldMetadataName: string;
};
const computeFieldMetadataRelationSettingsForRelationType = ({
  fieldMetadataName,
  relationType,
}: ComputeFieldMetadataRelationSettingsForRelationTypeArgs) => {
  if (relationType === RelationType.MANY_TO_ONE) {
    return {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
      joinColumnName: `${fieldMetadataName}Id`, // NOT GOOD ?
    };
  }

  return {
    relationType: RelationType.ONE_TO_MANY,
  };
};

type GenerateRelationOrMorphRelationFlatFieldMetadataPairUtilArgs = {
  targetFlatObjectMetadata: FlatObjectMetadata;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'> &
    Required<
      Pick<CreateFieldInput, 'relationCreationPayload' | 'type' | 'name'>
    > & { type: RelationFieldMetadataType };
  workspaceId: string;
};
export const generateRelationOrMorphRelationFlatFieldMetadataPairUtil = ({
  createFieldInput,
  sourceFlatObjectMetadata,
  targetFlatObjectMetadata,
  workspaceId,
}: GenerateRelationOrMorphRelationFlatFieldMetadataPairUtilArgs): FlatFieldMetadata<RelationFieldMetadataType>[] => {
  const { relationCreationPayload } = createFieldInput;

  const sourceFlatFieldMetadataSettings =
    computeFieldMetadataRelationSettingsForRelationType({
      fieldMetadataName: createFieldInput.name,
      relationType: relationCreationPayload.type,
    });
  const targetRelationTargetFieldMetadataId = v4();
  const sourceRelationTargetFieldMetadataId = v4();
  const sourceFlatFieldMetadata: Omit<
    FlatFieldMetadata<RelationFieldMetadataType>,
    'flatRelationTargetFieldMetadata'
  > = {
    ...getDefaultFlatFieldMetadata({
      createFieldInput,
      workspaceId,
      fieldMetadataId: sourceRelationTargetFieldMetadataId,
    }),
    objectMetadataId: sourceFlatObjectMetadata.id,
    icon: createFieldInput.icon ?? 'IconRelationOneToMany',
    type: createFieldInput.type,
    defaultValue: null,
    settings: sourceFlatFieldMetadataSettings,
    options: null,
    relationTargetFieldMetadataId: targetRelationTargetFieldMetadataId, // Note: this won't work until we enable deferred transaction
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
      fieldMetadataName: targetCreateFieldInput.name,
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

  return [
    {
      ...sourceFlatFieldMetadata,
      flatRelationTargetFieldMetadata: targetFlatFieldMetadata,
    },
    targetFlatFieldMetadata,
  ] satisfies FlatFieldMetadata<RelationFieldMetadataType>[];
};
