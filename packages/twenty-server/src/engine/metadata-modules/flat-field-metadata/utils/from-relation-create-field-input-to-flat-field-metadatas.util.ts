import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type RelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/relation-field-metadata-type.type';
import { validateRelationCreationPayloadOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/validate-relation-creation-payload-or-throw.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
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
      joinColumnName: `${fieldMetadataName}Id`,
    };
  }

  return {
    relationType: RelationType.ONE_TO_MANY,
  };
};

type FromRelationCreateFieldInputToFlatFieldMetadataArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'>;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  sourceParentFlatObjectMetadata: FlatObjectMetadata;
  workspaceId: string;
};
export const fromRelationCreateFieldInputToFlatFieldMetadatas = async ({
  existingFlatObjectMetadataMaps,
  sourceParentFlatObjectMetadata,
  createFieldInput,
  workspaceId,
}: FromRelationCreateFieldInputToFlatFieldMetadataArgs): Promise<
  FieldInputTranspilationResult<FlatFieldMetadata<RelationFieldMetadataType>[]>
> => {
  const rawCreationPayload = createFieldInput.relationCreationPayload;

  if (!isDefined(rawCreationPayload)) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Relation creation payload is required`,
        userFriendlyMessage: t`Relation creation payload is required`,
        value: rawCreationPayload,
      },
    };
  }

  if (
    createFieldInput.type !== FieldMetadataType.RELATION &&
    createFieldInput.type !== FieldMetadataType.MORPH_RELATION
  ) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Received invalida create field input in relation/morph_relation util, should never occur`,
        value: createFieldInput.type,
      },
    };
  }

  const relationCreationPayload =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreationPayload,
      ['targetFieldIcon', 'targetFieldLabel', 'targetObjectMetadataId', 'type'],
    );

  try {
    await validateRelationCreationPayloadOrThrow(relationCreationPayload);
  } catch (error) {
    if (error instanceof FieldMetadataException) {
      return {
        status: 'fail',
        error: {
          code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          message: `Relation creation payload is invalid ${JSON.stringify(relationCreationPayload)}`,
          userFriendlyMessage: t`Invalid relation creation payload`,
          value: relationCreationPayload,
        },
      };
    } else {
      throw error;
    }
  }

  const targetParentFlatObjectMetadata =
    existingFlatObjectMetadataMaps.byId[
      relationCreationPayload.targetObjectMetadataId
    ];

  if (!isDefined(targetParentFlatObjectMetadata)) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message: `Object metadata relation target not found for relation creation payload`,
        userFriendlyMessage: t`Object targeted by field to create not found`,
        value: relationCreationPayload,
      },
    };
  }

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
    icon: createFieldInput.icon ?? 'IconRelationOneToMany',
    type: createFieldInput.type,
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
    name: computeMetadataNameFromLabel(
      relationCreationPayload.targetFieldLabel,
    ),
    objectMetadataId: targetParentFlatObjectMetadata.id,
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
      relationTargetObjectMetadataId: sourceParentFlatObjectMetadata.id,
      flatRelationTargetFieldMetadata: sourceFlatFieldMetadata,
      flatRelationTargetObjectMetadata: sourceParentFlatObjectMetadata,
    };

  return {
    status: 'success',
    result: [
      {
        ...sourceFlatFieldMetadata,
        flatRelationTargetFieldMetadata: targetFlatFieldMetadata,
      },
      targetFlatFieldMetadata,
    ] satisfies FlatFieldMetadata<RelationFieldMetadataType>[],
  };
};
