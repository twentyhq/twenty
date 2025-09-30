import { t } from '@lingui/core/macro';
import { type RelationCreationPayload } from 'twenty-shared/types';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateRelationCreationPayloadOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/validate-relation-creation-payload-or-throw.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type ValidateRelationCreationPayloadUtilArgs = {
  relationCreationPayload: RelationCreationPayload;
  existingFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};
export const validateRelationCreationPayload = async ({
  existingFlatObjectMetadataMaps,
  relationCreationPayload: rawRelationCreationPayload,
}: ValidateRelationCreationPayloadUtilArgs): Promise<
  FieldInputTranspilationResult<{
    relationCreationPayload: RelationCreationPayload;
    targetFlatObjectMetadata: FlatObjectMetadata;
  }>
> => {
  const relationCreationPayload =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawRelationCreationPayload,
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
          message: `Relation creation payload is invalid`,
          userFriendlyMessage: t`Invalid relation creation payload`,
          value: relationCreationPayload,
        },
      };
    } else {
      throw error;
    }
  }

  const targetFlatObjectMetadata =
    existingFlatObjectMetadataMaps.byId[
      relationCreationPayload.targetObjectMetadataId
    ];

  if (!isDefined(targetFlatObjectMetadata)) {
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

  return {
    status: 'success',
    result: {
      relationCreationPayload,
      targetFlatObjectMetadata,
    },
  };
};
