import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { generateRatingOptions } from 'src/engine/metadata-modules/field-metadata/utils/generate-rating-optionts.util';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromMorphRelationCreateFieldInputToFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-morph-relation-create-field-input-to-flat-field-metadatas.util';
import { fromRelationCreateFieldInputToFlatFieldMetadatas } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-relation-create-field-input-to-flat-field-metadatas.util';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';

type FromCreateFieldInputToFlatObjectMetadataArgs = {
  rawCreateFieldInput: Omit<CreateFieldInput, 'workspaceId'>;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
  workspaceId: string;
};

export const fromCreateFieldInputToFlatFieldMetadatasToCreate = async ({
  rawCreateFieldInput,
  workspaceId,
  existingFlatObjectMetadataMaps,
}: FromCreateFieldInputToFlatObjectMetadataArgs): Promise<
  FieldInputTranspilationResult<FlatFieldMetadata[]>
> => {
  if (rawCreateFieldInput.isRemoteCreation) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
        message: "Remote fields aren't supported",
      },
    };
  }
  const createFieldInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateFieldInput,
      ['description', 'icon', 'label', 'name', 'objectMetadataId', 'type'],
    );
  const parentFlatObjectMetadataWithFlatFieldMaps =
    existingFlatObjectMetadataMaps.byId[createFieldInput.objectMetadataId];

  if (!isDefined(parentFlatObjectMetadataWithFlatFieldMaps)) {
    return {
      status: 'fail',
      error: {
        code: FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: 'Provided object metadata id does not exist',
        userFriendlyMessage: t`Created field metadata, parent object metadata not found`,
      },
    };
  }

  const parentFlatObjectMetadata =
    fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata(
      parentFlatObjectMetadataWithFlatFieldMaps,
    );

  const fieldMetadataId = v4();
  const commonFlatFieldMetadata = getDefaultFlatFieldMetadata({
    createFieldInput,
    workspaceId,
    fieldMetadataId,
  });

  switch (createFieldInput.type) {
    case FieldMetadataType.MORPH_RELATION: {
      return await fromMorphRelationCreateFieldInputToFlatFieldMetadatas({
        createFieldInput: {
          ...createFieldInput,
          type: createFieldInput.type,
        },
        existingFlatObjectMetadataMaps,
        sourceFlatObjectMetadata: parentFlatObjectMetadata,
        workspaceId,
      });
    }
    case FieldMetadataType.RELATION: {
      return await fromRelationCreateFieldInputToFlatFieldMetadatas({
        existingFlatObjectMetadataMaps,
        sourceFlatObjectMetadata: parentFlatObjectMetadata,
        createFieldInput: {
          ...createFieldInput,
          type: createFieldInput.type,
        },
        workspaceId,
      });
    }
    case FieldMetadataType.RATING: {
      return {
        status: 'success',
        result: [
          {
            ...commonFlatFieldMetadata,
            type: createFieldInput.type,
            settings: null,
            defaultValue: commonFlatFieldMetadata.defaultValue as string, // Could this be improved ?
            options: generateRatingOptions(),
          } satisfies FlatFieldMetadata<typeof createFieldInput.type>,
        ],
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
        result: [
          {
            ...commonFlatFieldMetadata,
            type: createFieldInput.type,
            options,
            defaultValue: commonFlatFieldMetadata.defaultValue as string, // Could this be improved ?
            settings: null,
          } satisfies FlatFieldMetadata<typeof createFieldInput.type>,
        ],
      };
    }
    case FieldMetadataType.TS_VECTOR: {
      return {
        status: 'fail',
        error: {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: 'TS Vector is not supported for field creation',
        },
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
    case FieldMetadataType.FULL_NAME:
    case FieldMetadataType.POSITION:
    case FieldMetadataType.ADDRESS:
    case FieldMetadataType.RAW_JSON:
    case FieldMetadataType.RICH_TEXT:
    case FieldMetadataType.RICH_TEXT_V2:
    case FieldMetadataType.ACTOR:
    case FieldMetadataType.ARRAY: {
      return {
        status: 'success',
        result: [
          {
            ...commonFlatFieldMetadata,
            type: createFieldInput.type,
          },
        ],
      };
    }
    default: {
      assertUnreachable(createFieldInput.type, 'Encountered an uncovered');
    }
  }
};
