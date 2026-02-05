import { msg } from '@lingui/core/macro';
import { type RelationCreationPayload } from 'twenty-shared/types';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateRelationCreationPayloadOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/validate-relation-creation-payload-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

type ValidateRelationCreationPayloadUtilArgs = {
  relationCreationPayload: RelationCreationPayload;
  existingUniversalFlatObjectMetadataMaps: UniversalFlatEntityMaps<UniversalFlatObjectMetadata>;
};
export const validateRelationCreationPayload = async ({
  existingUniversalFlatObjectMetadataMaps,
  relationCreationPayload: rawRelationCreationPayload,
}: ValidateRelationCreationPayloadUtilArgs): Promise<
  FieldInputTranspilationResult<{
    relationCreationPayload: RelationCreationPayload;
    targetUniversalFlatObjectMetadata: UniversalFlatObjectMetadata;
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
        errors: [
          {
            code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
            message: `Relation creation payload is invalid`,
            userFriendlyMessage: msg`Invalid relation creation payload`,
            value: relationCreationPayload,
          },
        ],
      };
    } else {
      throw error;
    }
  }

  const targetUniversalFlatObjectMetadata = findFlatEntityByUniversalIdentifier(
    {
      universalIdentifier: relationCreationPayload.targetObjectMetadataId,
      flatEntityMaps: existingUniversalFlatObjectMetadataMaps,
    },
  );

  if (!isDefined(targetUniversalFlatObjectMetadata)) {
    return {
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
          message: `Object metadata relation target not found for relation creation payload`,
          userFriendlyMessage: msg`Object targeted by field to create not found`,
          value: relationCreationPayload,
        },
      ],
    };
  }

  return {
    status: 'success',
    result: {
      relationCreationPayload,
      targetUniversalFlatObjectMetadata,
    },
  };
};
