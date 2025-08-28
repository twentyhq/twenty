import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  type FailedFieldInputTranspilation,
  type FieldInputTranspilationResult,
  type SuccessfulFieldInputTranspilation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromRelationCreateFieldInputToFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-relation-create-field-input-to-flat-field-metadatas.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FromMorphRelationCreateFieldInputToFlatFieldMetadatasArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'>;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  sourceParentFlatObjectMetadata: FlatObjectMetadata;
  workspaceId: string;
};
export const fromMorphRelationCreateFieldInputToFlatFieldMetadatas = async ({
  createFieldInput,
  existingFlatObjectMetadataMaps,
  sourceParentFlatObjectMetadata,
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

  for (const relationCreationPayload of rawMorphCreationPayload) {
    const transpilationResult =
      await fromRelationCreateFieldInputToFlatFieldMetadatas({
        createFieldInput: {
          ...createFieldInput,
          morphRelationsCreationPayload: undefined,
          relationCreationPayload,
        },
        existingFlatObjectMetadataMaps,
        sourceParentFlatObjectMetadata,
        workspaceId,
      });

    transpilationResult.status === 'fail'
      ? transpilationsReport.failed.push(transpilationResult)
      : transpilationsReport.success.push(transpilationResult);
  }

  if (transpilationsReport.failed.length > 0) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message: 'Morh relation input transpilation failed',
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
