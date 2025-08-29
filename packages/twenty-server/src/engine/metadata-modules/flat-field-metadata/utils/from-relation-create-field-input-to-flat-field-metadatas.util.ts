import { t } from '@lingui/core/macro';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-relation-field-join-column-name.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { validateRelationCreationPayload } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-relation-creation-payload.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FromRelationCreateFieldInputToFlatFieldMetadataArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'> & {
    type: FieldMetadataType.RELATION;
  };
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  workspaceId: string;
};
export const fromRelationCreateFieldInputToFlatFieldMetadatas = async ({
  existingFlatObjectMetadataMaps,
  sourceFlatObjectMetadata,
  createFieldInput,
  workspaceId,
}: FromRelationCreateFieldInputToFlatFieldMetadataArgs): Promise<
  FieldInputTranspilationResult<FlatFieldMetadata<FieldMetadataType.RELATION>[]>
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

  const relationValidationResult = await validateRelationCreationPayload({
    existingFlatObjectMetadataMaps,
    relationCreationPayload: rawCreationPayload,
  });

  if (relationValidationResult.status === 'fail') {
    return relationValidationResult;
  }
  const { relationCreationPayload, targetFlatObjectMetadata } =
    relationValidationResult.result;

  const flatFieldMetadatas = generateMorphOrRelationFlatFieldMetadataPair({
    createFieldInput: {
      ...createFieldInput,
      relationCreationPayload,
    },
    sourceFlatObjectMetadataJoinColumnName: computeRelationFieldJoinColumnName({
      name: createFieldInput.name,
    }),
    sourceFlatObjectMetadata,
    targetFlatObjectMetadata,
    workspaceId,
  });

  return {
    status: 'success',
    result:
      flatFieldMetadatas as FlatFieldMetadata<FieldMetadataType.RELATION>[],
  };
};
