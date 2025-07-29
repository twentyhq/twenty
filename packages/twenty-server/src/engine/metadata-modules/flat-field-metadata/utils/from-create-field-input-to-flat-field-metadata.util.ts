import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { generateRatingOptions } from 'src/engine/metadata-modules/field-metadata/utils/generate-rating-optionts.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { fromRelationCreateFieldInputToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-relation-create-field-input-to-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
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
  const commonFlatFieldMetadata = {
    createdAt,
    description: createFieldInput.description ?? null,
    id: fieldMetadataId,
    icon: createFieldInput.icon ?? null,
    isActive: true,
    isCustom: true,
    isLabelSyncedWithName: createFieldInput.isLabelSyncedWithName ?? false,
    isNullable: generateNullable(
      createFieldInput.type,
      createFieldInput.isNullable,
      createFieldInput.isRemoteCreation,
    ),
    isSystem: false,
    isUnique: createFieldInput.isUnique ?? null,
    label: createFieldInput.label ?? null,
    name: createFieldInput.name ?? null,
    objectMetadataId: createFieldInput.objectMetadataId, // TODO prastoin double check that CreateFieldInput validation runs correctly
    options: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    standardId: null,
    standardOverrides: null,
    type: createFieldInput.type,
    uniqueIdentifier: fieldMetadataId,
    updatedAt: createdAt,
    workspaceId: createFieldInput.workspaceId,
    settings: createFieldInput.settings ?? null,
    defaultValue:
      createFieldInput.defaultValue ??
      generateDefaultValue(createFieldInput.type), // TODO improve to be within each switch case
    flatRelationTargetFieldMetadata: null,
    flatRelationTargetObjectMetadata: null,
  } as const satisfies FlatFieldMetadata;

  switch (createFieldInput.type) {
    case FieldMetadataType.UUID:
      return [
        {
          flatFieldMetadata: {
            ...commonFlatFieldMetadata,
            isUnique: true,
          },
          parentFlatObjectMetadata,
        },
      ];
    case FieldMetadataType.RELATION:
    case FieldMetadataType.MORPH_RELATION: {
      return fromRelationCreateFieldInputToFlatFieldMetadata({
        commonFlatFieldMetadata,
        existingFlatObjectMetadatas,
        parentFlatObjectMetadata,
        relationCreationPayload: createFieldInput.relationCreationPayload,
        fieldMetadataType: createFieldInput.type,
      });
    }
    case FieldMetadataType.RATING: {
      return [
        {
          flatFieldMetadata: {
            ...commonFlatFieldMetadata,
            type: createFieldInput.type,
            settings: null,
            defaultValue:
              (createFieldInput.defaultValue as FlatFieldMetadata<FieldMetadataType.RATING>['defaultValue']) ??
              null, // will be validated by the flat field metadata validator
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
            options,
          },
          parentFlatObjectMetadata,
        },
      ];
    }
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
          flatFieldMetadata: commonFlatFieldMetadata,
          parentFlatObjectMetadata,
        },
      ];
    }
    default: {
      assertUnreachable(createFieldInput.type, 'Encountered an uncovered');
    }
  }
};
