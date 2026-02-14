import { msg } from '@lingui/core/macro';
import {
  FieldMetadataType,
  type FieldMetadataOptions,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { generateRatingOptions } from 'src/engine/metadata-modules/field-metadata/utils/generate-rating-optionts.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { fromMorphRelationCreateFieldInputToFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-morph-relation-create-field-input-to-flat-field-metadatas.util';
import { fromRelationCreateFieldInputToFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-relation-create-field-input-to-flat-field-metadatas.util';
import { generateIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-index-for-flat-field-metadata.util';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

export type FromCreateFieldInputToFlatObjectMetadataArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'>;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'>;

export const fromCreateFieldInputToFlatFieldMetadatasToCreate = async ({
  createFieldInput: rawCreateFieldInput,
  flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
  flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
  flatApplication,
}: FromCreateFieldInputToFlatObjectMetadataArgs): Promise<
  FieldInputTranspilationResult<{
    flatFieldMetadatas: UniversalFlatFieldMetadata[];
    indexMetadatas: UniversalFlatIndexMetadata[];
  }>
> => {
  if (rawCreateFieldInput.isRemoteCreation) {
    return {
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: "Remote fields aren't supported",
        },
      ],
    };
  }

  const createFieldInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateFieldInput,
      ['description', 'icon', 'label', 'name', 'objectMetadataId', 'type'],
    );
  const parentFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: createFieldInput.objectMetadataId,
    flatEntityMaps: existingFlatObjectMetadataMaps,
  });

  if (!isDefined(parentFlatObjectMetadata)) {
    return {
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
          message: 'Provided object metadata id does not exist',
          userFriendlyMessage: msg`Created field metadata, parent object metadata not found`,
        },
      ],
    };
  }

  const commonFlatFieldMetadata = getDefaultFlatFieldMetadata({
    createFieldInput,
    flatApplication,
    objectMetadataUniversalIdentifier:
      parentFlatObjectMetadata.universalIdentifier,
  });

  switch (createFieldInput.type) {
    case FieldMetadataType.MORPH_RELATION: {
      return await fromMorphRelationCreateFieldInputToFlatFieldMetadatas({
        createFieldInput: {
          ...createFieldInput,
          type: createFieldInput.type,
        },
        existingFlatObjectMetadataMaps,
        existingFlatFieldMetadataMaps,
        sourceFlatObjectMetadata: parentFlatObjectMetadata,
        flatApplication,
      });
    }
    case FieldMetadataType.RELATION: {
      return await fromRelationCreateFieldInputToFlatFieldMetadatas({
        existingFlatObjectMetadataMaps,
        existingFlatFieldMetadataMaps,
        sourceFlatObjectMetadata: parentFlatObjectMetadata,
        createFieldInput: {
          ...createFieldInput,
          type: createFieldInput.type,
        },
        flatApplication,
      });
    }
    case FieldMetadataType.RATING: {
      return {
        status: 'success',
        result: {
          flatFieldMetadatas: [
            {
              ...commonFlatFieldMetadata,
              type: createFieldInput.type,
              defaultValue: commonFlatFieldMetadata.defaultValue as string, // Could this be improved ?
              options: generateRatingOptions(),
              universalSettings: null,
            } satisfies UniversalFlatFieldMetadata<
              typeof createFieldInput.type
            >,
          ],
          indexMetadatas: [],
        },
      };
    }
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT: {
      const options = (createFieldInput?.options ?? []).map<
        FieldMetadataOptions<typeof createFieldInput.type>[number]
      >((option) => ({
        id: v4(),
        ...trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
          option as FieldMetadataOptions<typeof createFieldInput.type>[number],
          ['label', 'value', 'id', 'color'],
        ),
      }));

      return {
        status: 'success',
        result: {
          flatFieldMetadatas: [
            {
              ...commonFlatFieldMetadata,
              type: createFieldInput.type,
              options,
              defaultValue: commonFlatFieldMetadata.defaultValue as string, // Could this be improved ?
              universalSettings: null,
            } satisfies UniversalFlatFieldMetadata<
              typeof createFieldInput.type
            >,
          ],
          indexMetadatas: [],
        },
      };
    }
    case FieldMetadataType.TS_VECTOR: {
      return {
        status: 'fail',
        errors: [
          {
            code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
            message: 'TS Vector is not supported for field creation',
          },
        ],
      };
    }
    case FieldMetadataType.UUID:
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONES:
    case FieldMetadataType.EMAILS:
    case FieldMetadataType.DATE_TIME:
    case FieldMetadataType.DATE:
    case FieldMetadataType.BOOLEAN:
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.NUMERIC:
    case FieldMetadataType.LINKS:
    case FieldMetadataType.CURRENCY:
    case FieldMetadataType.FILES:
    case FieldMetadataType.FULL_NAME:
    case FieldMetadataType.POSITION:
    case FieldMetadataType.ADDRESS:
    case FieldMetadataType.RAW_JSON:
    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.RICH_TEXT_V2:
    case FieldMetadataType.ACTOR:
    case FieldMetadataType.ARRAY: {
      const indexMetadatas: UniversalFlatIndexMetadata[] = [];

      if (commonFlatFieldMetadata.isUnique) {
        indexMetadatas.push(
          generateIndexForFlatFieldMetadata({
            flatFieldMetadata: commonFlatFieldMetadata,
            flatObjectMetadata: parentFlatObjectMetadata,
          }),
        );
      }

      return {
        status: 'success',
        result: {
          flatFieldMetadatas: [
            {
              ...commonFlatFieldMetadata,
              type: createFieldInput.type,
            },
          ],
          indexMetadatas,
        },
      };
    }
    default: {
      assertUnreachable(createFieldInput.type, 'Encountered an uncovered');
    }
  }
};
