import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateRelationCreationPayloadOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/validate-relation-creation-payload.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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
      joinColumnName: fieldMetadataName,
    };
  }

  return {
    relationType: RelationType.ONE_TO_MANY,
  };
};

type FromRelationCreateFieldInputToFlatFieldMetadataArgs = {
  createFieldInput: CreateFieldInput;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  sourceParentFlatObjectMetadata: FlatObjectMetadata;
};
export const fromRelationCreateFieldInputToFlatFieldMetadata = async ({
  existingFlatObjectMetadataMaps,
  sourceParentFlatObjectMetadata,
  createFieldInput,
}: FromRelationCreateFieldInputToFlatFieldMetadataArgs): Promise<
  FlatFieldMetadata[]
> => {
  const { relationCreationPayload } = createFieldInput;

  if (!isDefined(relationCreationPayload)) {
    throw new FieldMetadataException(
      `Relation creation payload is required`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
  await validateRelationCreationPayloadOrThrow(relationCreationPayload);

  const targetParentFlatObjectMetadata =
    existingFlatObjectMetadataMaps.byId[
      relationCreationPayload.targetObjectMetadataId
    ];

  if (!isDefined(targetParentFlatObjectMetadata)) {
    throw new FieldMetadataException(
      `Object metadata relation target not found for relation creation payload`,
      FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
    );
  }

  const sourceFlatFieldMetadataSettings =
    computeFieldMetadataRelationSettingsForRelationType({
      fieldMetadataName: createFieldInput.name,
      relationType: relationCreationPayload.type,
    });
  const targetRelationTargetFieldMetadataId = v4();
  const sourceRelationTargetFieldMetadataId = v4();
  const sourceFlatFieldMetadata: Omit<
    FlatFieldMetadata<FieldMetadataType.RELATION>,
    'flatRelationTargetFieldMetadata'
  > = {
    ...getDefaultFlatFieldMetadata({
      createFieldInput,
      fieldMetadataId: sourceRelationTargetFieldMetadataId,
    }),
    icon: createFieldInput.icon ?? 'IconRelationOneToMany',
    type: FieldMetadataType.RELATION,
    defaultValue: null,
    settings: sourceFlatFieldMetadataSettings,
    options: null,
    relationTargetFieldMetadataId: targetRelationTargetFieldMetadataId, // Note: this won't work until we enable deferred transaction
    relationTargetObjectMetadataId: targetParentFlatObjectMetadata.id,
    flatRelationTargetObjectMetadata: targetParentFlatObjectMetadata,
  };

  const targetCreateFieldInput: CreateFieldInput = {
    icon: relationCreationPayload.targetFieldIcon ?? 'Icon123',
    label: relationCreationPayload.targetFieldLabel,
    name: `${computeMetadataNameFromLabel(
      relationCreationPayload.targetFieldLabel,
    )}Id`,
    objectMetadataId: targetParentFlatObjectMetadata.id,
    type: FieldMetadataType.RELATION,
    workspaceId: createFieldInput.workspaceId,
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
        fieldMetadataId: targetRelationTargetFieldMetadataId,
      }),
      type: FieldMetadataType.RELATION,
      defaultValue: null,
      settings: targetFlatFieldMetadataSettings,
      options: null,
      relationTargetFieldMetadataId: sourceRelationTargetFieldMetadataId,
      relationTargetObjectMetadataId: sourceParentFlatObjectMetadata.id,
      flatRelationTargetFieldMetadata: sourceFlatFieldMetadata,
      flatRelationTargetObjectMetadata: sourceParentFlatObjectMetadata,
    };

  return [
    {
      ...sourceFlatFieldMetadata,
      flatRelationTargetFieldMetadata: targetFlatFieldMetadata,
    },
    targetFlatFieldMetadata,
  ] satisfies FlatFieldMetadata<FieldMetadataType.RELATION>[];
};
