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
import {
  FlatObjectMetadata,
  FlatObjectMetadataWithoutFields,
} from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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

  const createdAt = new Date();
  const targetRelationTargetFieldMetadaataId = v4();
  const sourceRelationTargetFieldMetadataId = v4();
  const sourceFlatFieldMetadata: FlatFieldMetadata<FieldMetadataType.RELATION> =
    {
      ...getDefaultFlatFieldMetadata({
        createdAt,
        createFieldInput,
        fieldMetadataId: sourceRelationTargetFieldMetadataId,
      }),
      type: FieldMetadataType.RELATION,
      defaultValue: null,
      settings: null,
      options: null,
      relationTargetFieldMetadataId: targetRelationTargetFieldMetadaataId, // Note: this won't work until we enable deferred transaction
      relationTargetObjectMetadataId: targetParentFlatObjectMetadata.id,
      flatRelationTargetFieldMetadata: {} as FlatFieldMetadata,
      flatRelationTargetObjectMetadata: {} as FlatObjectMetadataWithoutFields,
    };

  const targetFlatFieldMetadata: FlatFieldMetadata<FieldMetadataType.RELATION> =
    {
      ...getDefaultFlatFieldMetadata({
        createdAt,
        createFieldInput: {
          icon: relationCreationPayload.targetFieldIcon,
          label: relationCreationPayload.targetFieldLabel,
          name: computeMetadataNameFromLabel(
            relationCreationPayload.targetFieldLabel,
          ),
          objectMetadataId: targetParentFlatObjectMetadata.id,
          type: FieldMetadataType.RELATION,
          workspaceId: createFieldInput.workspaceId,
        },
        fieldMetadataId: targetRelationTargetFieldMetadaataId,
      }),
      type: FieldMetadataType.RELATION,
      defaultValue: null,
      settings: null,
      options: null,
      relationTargetFieldMetadataId: sourceRelationTargetFieldMetadataId,
      relationTargetObjectMetadataId: sourceParentFlatObjectMetadata.id,
      flatRelationTargetFieldMetadata: {} as FlatFieldMetadata,
      flatRelationTargetObjectMetadata: {} as FlatObjectMetadataWithoutFields,
    };

  return [
    {
      flatFieldMetadata: sourceFlatFieldMetadata,
      parentFlatObjectMetadata: sourceParentFlatObjectMetadata,
    },
    {
      flatFieldMetadata: targetFlatFieldMetadata,
      parentFlatObjectMetadata: targetParentFlatObjectMetadata,
    },
  ] satisfies FlatFieldMetadataAndParentFlatObjectMetadata<FieldMetadataType.RELATION>[];
};
