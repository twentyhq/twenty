import { t } from '@lingui/core/macro';
import { type FieldMetadataType } from 'twenty-shared/types';
import {
  computeMorphRelationFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { validateMorphRelationCreationPayload } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-relation-creation-payload.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FromMorphRelationCreateFieldInputToFlatFieldMetadatasArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'> & {
    type: FieldMetadataType.MORPH_RELATION;
  };
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  workspaceId: string;
};
export const fromMorphRelationCreateFieldInputToFlatFieldMetadatas = async ({
  createFieldInput,
  existingFlatObjectMetadataMaps,
  sourceFlatObjectMetadata,
  workspaceId,
}: FromMorphRelationCreateFieldInputToFlatFieldMetadatasArgs): Promise<
  FieldInputTranspilationResult<
    FlatFieldMetadata<MorphOrRelationFieldMetadataType>[]
  >
> => {
  const rawMorphCreationPayload =
    createFieldInput.morphRelationsCreationPayload;

  if (
    !isDefined(rawMorphCreationPayload) ||
    !Array.isArray(rawMorphCreationPayload)
  ) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: `Relation creation payload is required`,
        userFriendlyMessage: t`Relation creation payload is required`,
        value: rawMorphCreationPayload,
      },
    };
  }

  const morphRelationCreationPayloadValidation =
    await validateMorphRelationCreationPayload({
      existingFlatObjectMetadataMaps,
      morphRelationCreationPayload: rawMorphCreationPayload,
    });

  if (morphRelationCreationPayloadValidation.status === 'fail') {
    return morphRelationCreationPayloadValidation;
  }

  const morphRelationCreationPayload =
    morphRelationCreationPayloadValidation.result;

  const flatFieldMetadatas = morphRelationCreationPayload.flatMap(
    ({ relationCreationPayload, targetFlatObjectMetadata }) => {
      const sourceFlatObjectMetadataJoinColumnName =
        computeMorphRelationFieldJoinColumnName({
          name: createFieldInput.name,
          targetObjectMetadataNameSingular:
            targetFlatObjectMetadata.nameSingular,
        });

      return generateMorphOrRelationFlatFieldMetadataPair({
        createFieldInput: {
          ...createFieldInput,
          relationCreationPayload,
        },
        sourceFlatObjectMetadataJoinColumnName,
        sourceFlatObjectMetadata,
        targetFlatObjectMetadata,
        workspaceId,
      });
    },
  );

  return {
    status: 'success',
    result: flatFieldMetadatas,
  };
};
