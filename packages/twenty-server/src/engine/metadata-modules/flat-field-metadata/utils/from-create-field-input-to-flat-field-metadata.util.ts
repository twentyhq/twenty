import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { FieldMetadataType } from 'twenty-shared/types';
import {
    assertUnreachable,
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

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

  const commonFlatFieldMetadata: FlatFieldMetadata = {
    createdAt,
    description: createFieldInput.description ?? null,
    id: fieldMetadataId,
    icon: createFieldInput.icon ?? null,
    isActive: true,
    isCustom: true,
    isLabelSyncedWithName: createFieldInput.isLabelSyncedWithName ?? false,
    isNullable: createFieldInput.isNullable ?? true,
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
    defaultValue: createFieldInput.defaultValue ?? null,
    flatRelationTargetFieldMetadata: null,
    flatRelationTargetObjectMetadata: null,
  };

  switch (createFieldInput.type) {
    case FieldMetadataType.UUID:
      return {
        ...commonFlatFieldMetadata,
        isUnique: true,
      };
    case FieldMetadataType.RELATION:
    case FieldMetadataType.MORPH_RELATION: {
      return {
        ...commonFlatFieldMetadata,
        type: createFieldInput.type,
        defaultValue: null,
        settings: null,
        options: null,
        relationTargetFieldMetadataId: '',
        relationTargetObjectMetadataId: '',
        // TODO retrieve from objectMetadataMaps
        flatRelationTargetFieldMetadata: {} as FlatFieldMetadata,
        flatRelationTargetObjectMetadata: {} as FlatObjectMetadataWithoutFields,
        ///
      } satisfies FlatFieldMetadata<
        FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
      >;
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
    case FieldMetadataType.RATING:
    case FieldMetadataType.SELECT:
    case FieldMetadataType.MULTI_SELECT:
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
