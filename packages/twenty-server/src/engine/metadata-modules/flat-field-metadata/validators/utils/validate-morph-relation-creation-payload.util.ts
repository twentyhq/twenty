import { msg } from '@lingui/core/macro';
import { isDefined } from 'class-validator';
import { type RelationCreationPayload } from 'twenty-shared/types';

import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
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
      errors: [
        {
          code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          message: 'Morph relation creation payloads are empty',
          userFriendlyMessage: msg`At least one relation is require`,
        },
      ],
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
      errors: [
        {
          code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          message:
            'Morph relation creation payloads must have the same relation type',
          userFriendlyMessage: msg`Morph relation creation payloads must have the same relation type`,
        },
      ],
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
      errors: [
        {
          code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          message:
            'Morph relation creation payloads must not target source object metadata',
          userFriendlyMessage: msg`Morph relation creation payloads must only contain relation to other object metadata`,
        },
      ],
    };
  }

  if (
    allRelatedObjectMetadataIds.length !== allRelatedObjectMetadataIdsSet.length
  ) {
    return {
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          message:
            'Morph relation creation payloads must have only relation to the same object metadata',
          userFriendlyMessage: msg`Morph relation creation payloads must only contain relation to the same object metadata`,
        },
      ],
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
      errors: [
        {
          code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          message: 'Morph relation input transpilation failed',
          userFriendlyMessage: msg`Invalid morph relation input`,
          value: relationCreationPayloadReport.failed
            .flatMap((failedTranspilation) =>
              failedTranspilation.errors.map((error) => error.value),
            )
            .filter(isDefined),
        },
      ],
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
