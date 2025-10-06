import { t } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { type RelationCreationPayload } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import {
  type FailedFieldInputTranspilation,
  type FieldInputTranspilationResult,
  type SuccessfulFieldInputTranspilation,
} from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { validateRelationCreationPayload } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-relation-creation-payload.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type RelationCreationPayloadAndObjectMetadata = {
  relationCreationPayload: RelationCreationPayload;
  targetFlatObjectMetadata: FlatObjectMetadata;
};

type ValidateMorphRelationCreationPayloadUtilArgs = {
  morphRelationCreationPayload: RelationCreationPayload[];
  existingFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  objectMetadataId: string;
};
export const validateMorphRelationCreationPayload = async ({
  existingFlatObjectMetadataMaps,
  morphRelationCreationPayload,
  objectMetadataId,
}: ValidateMorphRelationCreationPayloadUtilArgs): Promise<
  FieldInputTranspilationResult<RelationCreationPayloadAndObjectMetadata[]>
> => {
  if (morphRelationCreationPayload.length === 0) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message: 'Morph relation creation payloads are empty',
        userFriendlyMessage: t`At least one relation is require`,
      },
    };
  }

  const allRelationType = [
    ...new Set(
      morphRelationCreationPayload.map(
        (relationCreationPayload) => relationCreationPayload.type,
      ),
    ),
  ];

  if (allRelationType.length > 1) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message:
          'Morph relation creation payloads must have the same relation type',
        userFriendlyMessage: t`Morph relation creation payloads must have the same relation type`,
      },
    };
  }

  const allRelatedObjectMetadataIds = morphRelationCreationPayload.map(
    (relationCreationPayload) => relationCreationPayload.targetObjectMetadataId,
  );
  const allRelatedObjectMetadataIdsSet = [
    ...new Set(allRelatedObjectMetadataIds),
  ];

  if (allRelatedObjectMetadataIdsSet.includes(objectMetadataId)) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message:
          'Morph relation creation payloads must not target source object metadata',
        userFriendlyMessage: t`Morph relation creation payloads must only contain relation to other object metadata`,
      },
    };
  }

  if (
    allRelatedObjectMetadataIds.length !== allRelatedObjectMetadataIdsSet.length
  ) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message:
          'Morph relation creation payloads must have only relation to the same object metadata',
        userFriendlyMessage: t`Morph relation creation payloads must only contain relation to the same object metadata`,
      },
    };
  }

  const relationCreationPayloadReport: {
    success: SuccessfulFieldInputTranspilation<RelationCreationPayloadAndObjectMetadata>[];
    failed: FailedFieldInputTranspilation[];
  } = {
    success: [],
    failed: [],
  };

  for (const rawRelationCreationPayload of morphRelationCreationPayload) {
    const relationValidationResult = await validateRelationCreationPayload({
      existingFlatObjectMetadataMaps,
      relationCreationPayload: rawRelationCreationPayload,
    });

    if (relationValidationResult.status === 'fail') {
      relationCreationPayloadReport.failed.push(relationValidationResult);
      continue;
    }

    const { relationCreationPayload, targetFlatObjectMetadata } =
      relationValidationResult.result;

    relationCreationPayloadReport.success.push({
      status: 'success',
      result: {
        relationCreationPayload,
        targetFlatObjectMetadata,
      },
    });
  }

  if (relationCreationPayloadReport.failed.length > 0) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        message: 'Morph relation input transpilation failed',
        userFriendlyMessage: t`Invalid morph relation input`,
        value: relationCreationPayloadReport.failed
          .map((failedTranspilation) => failedTranspilation.error.value)
          .filter(isDefined),
      },
    };
  }

  return {
    status: 'success',
    result: relationCreationPayloadReport.success.map(
      (relationCreationPayloadValidation) =>
        relationCreationPayloadValidation.result,
    ),
  };
};
