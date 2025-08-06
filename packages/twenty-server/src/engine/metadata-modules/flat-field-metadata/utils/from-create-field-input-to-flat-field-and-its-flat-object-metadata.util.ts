import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { generateRatingOptions } from 'src/engine/metadata-modules/field-metadata/utils/generate-rating-optionts.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromRelationCreateFieldInputToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-relation-create-field-input-to-flat-field-metadata.util';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

type FromCreateFieldInputToFlatObjectMetadata = {
  rawCreateFieldInput: CreateFieldInput;
  existingFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};

export const fromCreateFieldInputToFlatFieldAndItsFlatObjectMetadata = async ({
  rawCreateFieldInput,
  existingFlatObjectMetadataMaps,
}: FromCreateFieldInputToFlatObjectMetadata): Promise<FlatFieldMetadata[]> => {
  if (rawCreateFieldInput.isRemoteCreation) {
    throw new FieldMetadataException(
      "Remote fields aren't supported",
      FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
    );
  }
  const createFieldInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateFieldInput,
      ['description', 'icon', 'label', 'name', 'objectMetadataId', 'type'],
    );
  const parentFlatObjectMetadata =
    existingFlatObjectMetadataMaps.byId[createFieldInput.objectMetadataId];

  if (!isDefined(parentFlatObjectMetadata)) {
    throw new FieldMetadataException(
      'Provided object metadata id does not exist',
      FieldMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      {
        userFriendlyMessage:
          'Created field metadata, parent object metadata not found',
      },
    );
  }

  const fieldMetadataId = v4();
  const commonFlatFieldMetadata = getDefaultFlatFieldMetadata({
    createFieldInput,
    fieldMetadataId,
  });

  switch (createFieldInput.type) {
    case FieldMetadataType.MORPH_RELATION: {
      throw new UserInputError(
        'Morph relation feature is not migrated to workspace migration v2 yet',
      );
    }
    case FieldMetadataType.RELATION: {
      return fromRelationCreateFieldInputToFlatFieldMetadata({
        existingFlatObjectMetadataMaps,
        sourceParentFlatObjectMetadata: parentFlatObjectMetadata,
        createFieldInput,
      });
    }
    case FieldMetadataType.RATING: {
      return [
        {
          ...commonFlatFieldMetadata,
          type: createFieldInput.type,
          settings: null,
          defaultValue: commonFlatFieldMetadata.defaultValue as string, // Could this be improved ?
          options: generateRatingOptions(),
        } satisfies FlatFieldMetadata<typeof createFieldInput.type>,
      ];
    }
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT: {
      const options = (createFieldInput?.options ?? []).map<
        FieldMetadataOptions<typeof createFieldInput.type>[number]
      >((option) => ({
        ...trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
          option as FieldMetadataOptions<typeof createFieldInput.type>[number],
          ['label', 'value', 'id', 'color'],
        ),
      }));

      return [
        {
          ...commonFlatFieldMetadata,
          type: createFieldInput.type,
          options,
          defaultValue: commonFlatFieldMetadata.defaultValue as string, // Could this be improved ?
          settings: null,
        } satisfies FlatFieldMetadata<typeof createFieldInput.type>,
      ];
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
    case FieldMetadataType.ARRAY:
    case FieldMetadataType.TS_VECTOR: {
      return [
        {
          ...commonFlatFieldMetadata,
          type: createFieldInput.type,
        },
      ];
    }
    default: {
      assertUnreachable(createFieldInput.type, 'Encountered an uncovered');
    }
  }
};
