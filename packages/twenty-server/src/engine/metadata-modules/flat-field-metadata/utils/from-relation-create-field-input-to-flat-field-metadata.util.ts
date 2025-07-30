import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateRelationCreationPayloadOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/validate-relation-creation-payload.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatFieldMetadataAndParentFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-create-field-input-to-flat-field-metadata.util';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';

type FromRelationCreateFieldInputToFlatFieldMetadataArgs = {
  createFieldInput: CreateFieldInput;
  existingFlatObjectMetadatas: FlatObjectMetadata[];
  sourceParentFlatObjectMetadata: FlatObjectMetadata;
};
export const fromRelationCreateFieldInputToFlatFieldMetadata = async ({
  existingFlatObjectMetadatas,
  sourceParentFlatObjectMetadata,
  createFieldInput,
}: FromRelationCreateFieldInputToFlatFieldMetadataArgs): Promise<
  FlatFieldMetadataAndParentFlatObjectMetadata[]
> => {
  const { relationCreationPayload } = createFieldInput;

  if (!isDefined(relationCreationPayload)) {
    throw new FieldMetadataException(
      `Relation creation payload is required`,
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
  await validateRelationCreationPayloadOrThrow(relationCreationPayload);

  const targetParentFlatObjectMetadata = existingFlatObjectMetadatas.find(
    (existingFlatObject) =>
      existingFlatObject.id === relationCreationPayload.targetObjectMetadataId,
  );

  if (!isDefined(targetParentFlatObjectMetadata)) {
    throw new FieldMetadataException(
      `Object metadata relation target not found for relation creation payload`,
      FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
    );
  }

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
    type: FieldMetadataType.RELATION,
    defaultValue: null,
    settings: null,
    options: null,
    relationTargetFieldMetadataId: targetRelationTargetFieldMetadataId, // Note: this won't work until we enable deferred transaction
    relationTargetObjectMetadataId: targetParentFlatObjectMetadata.id,
    flatRelationTargetObjectMetadata: targetParentFlatObjectMetadata,
  };

  const targetFlatFieldMetadata: FlatFieldMetadata<FieldMetadataType.RELATION> =
    {
      ...getDefaultFlatFieldMetadata({
        createFieldInput: {
          icon: relationCreationPayload.targetFieldIcon,
          label: relationCreationPayload.targetFieldLabel,
          name: `${computeMetadataNameFromLabel(
            relationCreationPayload.targetFieldLabel,
          )}Id`,
          objectMetadataId: targetParentFlatObjectMetadata.id,
          type: FieldMetadataType.RELATION,
          workspaceId: createFieldInput.workspaceId,
        },
        fieldMetadataId: targetRelationTargetFieldMetadataId,
      }),
      type: FieldMetadataType.RELATION,
      defaultValue: null,
      settings: null,
      options: null,
      relationTargetFieldMetadataId: sourceRelationTargetFieldMetadataId,
      relationTargetObjectMetadataId: sourceParentFlatObjectMetadata.id,
      flatRelationTargetFieldMetadata: sourceFlatFieldMetadata,
      flatRelationTargetObjectMetadata: sourceParentFlatObjectMetadata,
    };

  return [
    {
      flatFieldMetadata: {
        ...sourceFlatFieldMetadata,
        flatRelationTargetFieldMetadata: targetFlatFieldMetadata,
      },
      parentFlatObjectMetadata: sourceParentFlatObjectMetadata,
    },
    {
      flatFieldMetadata: targetFlatFieldMetadata,
      parentFlatObjectMetadata: targetParentFlatObjectMetadata,
    },
  ] satisfies FlatFieldMetadataAndParentFlatObjectMetadata<FieldMetadataType.RELATION>[];
};
