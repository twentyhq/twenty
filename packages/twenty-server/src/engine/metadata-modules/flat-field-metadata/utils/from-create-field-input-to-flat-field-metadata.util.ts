import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import {
  FieldMetadataComplexOption,
  FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { generateNullable } from 'src/engine/metadata-modules/field-metadata/utils/generate-nullable';
import { generateRatingOptions } from 'src/engine/metadata-modules/field-metadata/utils/generate-rating-optionts.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  assertUnreachable,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const prepareCustomFieldMetadataOptions = (
  options: FieldMetadataDefaultOption[] | FieldMetadataComplexOption[],
): undefined | Pick<FieldMetadataEntity, 'options'> => {
  return {
    options: options.map((option) => ({
      id: v4(),
      ...trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(option, [
        'label',
        'value',
        'id',
      ]),
    })),
  };
};

type FromCreateObjectInputToFlatObjectMetadata = {
  rawCreateFieldInput: CreateFieldInput;
  objectMetadataMaps: ObjectMetadataMaps;
};
export const fromCreateObjectInputToFlatObjectMetadata = ({
  objectMetadataMaps,
  rawCreateFieldInput,
}: FromCreateObjectInputToFlatObjectMetadata): FlatFieldMetadata => {
  // Handled in FlatFieldMetadata validation
  if (rawCreateFieldInput.isRemoteCreation) {
    throw new Error('Remote fields are not supported yet');
  }

  const createFieldInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateFieldInput,
      ['description', 'icon', 'label', 'name', 'objectMetadataId', 'type'],
    );

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
      generateDefaultValue(createFieldInput.type), // TODO improve
    flatRelationTargetFieldMetadata: null,
    flatRelationTargetObjectMetadata: null,
  } as const satisfies FlatFieldMetadata;

  switch (createFieldInput.type) {
    case FieldMetadataType.UUID:
      return {
        ...commonFlatFieldMetadata,
        isUnique: true,
      };
    case FieldMetadataType.RELATION:
    case FieldMetadataType.MORPH_RELATION: {
      // Should validate relationCreationPayload here
      return {
        ...commonFlatFieldMetadata,
        type: createFieldInput.type,
        defaultValue: null,
        settings: null,
        options: null,
        // TODO retrieve from objectMetadataMaps
        relationTargetFieldMetadataId: '',
        relationTargetObjectMetadataId: '',
        flatRelationTargetFieldMetadata: {} as FlatFieldMetadata,
        flatRelationTargetObjectMetadata: {} as FlatObjectMetadataWithoutFields,
        ///
      } satisfies FlatFieldMetadata<typeof createFieldInput.type>;
    }
    case FieldMetadataType.RATING: {
      return {
        ...commonFlatFieldMetadata,
        type: createFieldInput.type,
        settings: null,
        defaultValue:
          (createFieldInput.defaultValue as FlatFieldMetadata<FieldMetadataType.RATING>['defaultValue']) ??
          null, // Should we leave this to the FlatFieldMetadataValidator<FieldMetadataType.RATING> :) ?s
        options: generateRatingOptions(),
      } satisfies FlatFieldMetadata<typeof createFieldInput.type>;
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

      return {
        ...commonFlatFieldMetadata,
        options,
      };
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
      return commonFlatFieldMetadata;
    }
    default: {
      assertUnreachable(createFieldInput.type, 'Encountered an uncovered');
    }
  }
};
