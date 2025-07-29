import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { generateRatingOptions } from 'src/engine/metadata-modules/field-metadata/utils/generate-rating-optionts.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromRelationCreateFieldInputToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-relation-create-field-input-to-flat-field-metadata.util';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
  trimAndRemoveDuplicatedWhitespacesFromString,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

export type FromCreateObjectInputToFlatObjectMetadata = {
  rawCreateFieldInput: CreateFieldInput;
  existingFlatObjectMetadatas: FlatObjectMetadata[];
};
export type FlatFieldMetadataAndParentFlatObjectMetadata<
  T extends FieldMetadataType = FieldMetadataType,
> = {
  flatFieldMetadata: FlatFieldMetadata<T>;
  parentFlatObjectMetadata: FlatObjectMetadata;
};
const sanitizeStringIfDefined = (str: unknown) => {
  return isDefined(str) && typeof str === 'string'
    ? trimAndRemoveDuplicatedWhitespacesFromString(str)
    : null;
};

export const fromCreateFieldInputToFlatFieldMetadata = async ({
  existingFlatObjectMetadatas,
  rawCreateFieldInput,
}: FromCreateObjectInputToFlatObjectMetadata): Promise<
  FlatFieldMetadataAndParentFlatObjectMetadata[]
> => {
  // Handled in FlatFieldMetadata validation
  if (rawCreateFieldInput.isRemoteCreation) {
    throw new Error(
      'TODO custom CREATE_FIELD_INPUT exception: Remote fields are not supported yet',
    );
  }

  const createFieldInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateFieldInput,
      ['description', 'icon', 'label', 'name', 'objectMetadataId', 'type'],
    );
  const parentFlatObjectMetadata = existingFlatObjectMetadatas.find(
    (existingFlatObjectMetadata) =>
      existingFlatObjectMetadata.id === createFieldInput.objectMetadataId,
  );

  if (!isDefined(parentFlatObjectMetadata)) {
    throw new Error(
      'TODO custom CREATE_FIELD_INPUT exception: Provided object metadata id does not exist',
    );
  }

  const fieldMetadataId = v4();
  const createdAt = new Date();
  const commonFlatFieldMetadata = getDefaultFlatFieldMetadata({
    createdAt,
    createFieldInput,
    fieldMetadataId,
  });

  switch (createFieldInput.type) {
    case FieldMetadataType.MORPH_RELATION: {
      throw new Error('TODO prastoin implement');
    }
    case FieldMetadataType.RELATION: {
      return fromRelationCreateFieldInputToFlatFieldMetadata({
        existingFlatObjectMetadatas,
        sourceParentFlatObjectMetadata: parentFlatObjectMetadata,
        createFieldInput,
      });
    }
    case FieldMetadataType.RATING: {
      return [
        {
          flatFieldMetadata: {
            ...commonFlatFieldMetadata,
            type: createFieldInput.type,
            settings: null,
            defaultValue: commonFlatFieldMetadata.defaultValue as string, // Could this be improved ?
            options: generateRatingOptions(),
          } satisfies FlatFieldMetadata<typeof createFieldInput.type>,
          parentFlatObjectMetadata,
        },
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
          flatFieldMetadata: {
            ...commonFlatFieldMetadata,
            type: createFieldInput.type,
            options,
            defaultValue: commonFlatFieldMetadata.defaultValue as string, // Could this be improved ?
            settings: null,
          } satisfies FlatFieldMetadata<typeof createFieldInput.type>,
          parentFlatObjectMetadata,
        },
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
          flatFieldMetadata: {
            ...commonFlatFieldMetadata,
            type: createFieldInput.type,
          },
          parentFlatObjectMetadata,
        },
      ];
    }
    default: {
      assertUnreachable(createFieldInput.type, 'Encountered an uncovered');
    }
  }
};
