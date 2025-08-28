import { t } from '@lingui/core/macro';
import { type FieldMetadataType } from 'twenty-shared/types';
import {
  computeMorphRelationFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  type FailedFieldInputTranspilation,
  type FieldInputTranspilationResult,
  type SuccessfulFieldInputTranspilation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateRelationOrMorphRelationFlatFieldMetadataPairUtil } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-relation-or-morph-relation-flat-field-metadata-pair.util';
import { validateRelationCreationPayload } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-relation-creation-payload.util';
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
  FieldInputTranspilationResult<FlatFieldMetadata[]>
> => {
  const rawMorphCreationPayload =
    createFieldInput.morphRelationsCreationPayload;

  if (!isDefined(rawMorphCreationPayload)) {
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
  const transpilationsReport: {
    success: SuccessfulFieldInputTranspilation<FlatFieldMetadata[]>[];
    failed: FailedFieldInputTranspilation[];
  } = {
    success: [],
    failed: [],
  };

  const allRelationType = [
    ...new Set(
      rawMorphCreationPayload.map(
        (relationCreationPayload) => relationCreationPayload.type,
      ),
    ),
  ];
  if (allRelationType.length > 1) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message: 'Morph relation relations must have the same relation type',
        userFriendlyMessage: t`Morph relation relations must have the same relation type`,
      },
    };
  }

  const allRelatedObjectMetadataIds = rawMorphCreationPayload.map(
    (relationCreationPayload) => relationCreationPayload.targetObjectMetadataId,
  );
  const allRelatedObjectMetadataIdsSet = [
    ...new Set(allRelatedObjectMetadataIds),
  ];
  if (
    allRelatedObjectMetadataIds.length !== allRelatedObjectMetadataIdsSet.length
  ) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message:
          'Morph relation relations must have only relation to the same object metadata',
        userFriendlyMessage: t`Morph relation relations must have only relation to the same object metadata`,
      },
    };
  }

  for (const rawRelationCreationPayload of rawMorphCreationPayload) {
    const relationValidationResult = await validateRelationCreationPayload({
      existingFlatObjectMetadataMaps,
      relationCreationPayload: rawRelationCreationPayload,
    });

    if (relationValidationResult.status === 'fail') {
      transpilationsReport.failed.push(relationValidationResult);
      continue;
    }
    const { relationCreationPayload, targetFlatObjectMetadata } =
      relationValidationResult.result;

    const sourceFlatObjectMetadataJoinColumnName =
      computeMorphRelationFieldJoinColumnName({
        name: createFieldInput.name,
        targetObjectMetadataNameSingular: targetFlatObjectMetadata.nameSingular,
      });
    const flatFieldMetadatas =
      generateRelationOrMorphRelationFlatFieldMetadataPairUtil({
        createFieldInput: {
          ...createFieldInput,
          relationCreationPayload,
        },
        sourceFlatObjectMetadataJoinColumnName,
        sourceFlatObjectMetadata,
        targetFlatObjectMetadata,
        workspaceId,
      });

    transpilationsReport.success.push({
      status: 'success',
      result: flatFieldMetadatas,
    });
  }

  if (transpilationsReport.failed.length > 0) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message: 'Morph relation input transpilation failed',
        userFriendlyMessage: t`Invalid morph relation input`,
        value: transpilationsReport.failed
          .map((failedTranspilation) => failedTranspilation.error.value)
          .filter(isDefined),
      },
    };
  }

  const flatFieldMetadatas = transpilationsReport.success.flatMap(
    (transpilationResult) => transpilationResult.result,
  );

  return {
    status: 'success',
    result: flatFieldMetadatas,
  };
};
