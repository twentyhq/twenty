import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FlatFieldMetadataSecond } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatRelationTargetFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-relation-target-field-metadata.type';

export const fromFlatFieldMetadataToFieldMetadataDto = (
  flatFieldMetadata: FlatFieldMetadataSecond | FlatRelationTargetFieldMetadata,
): FieldMetadataDTO => {
  const {
    createdAt,
    updatedAt,
    description,
    icon,
    standardOverrides,
    isNullable,
    isUnique,
    settings,
    id,
    label,
    name,
    objectMetadataId,
    type,
    workspaceId,
    defaultValue,
    isActive,
    isCustom,
    isLabelSyncedWithName,
    isSystem,
    isUIReadOnly,
    options,
  } = flatFieldMetadata;

  return {
    id,
    label,
    name,
    objectMetadataId,
    type,
    workspaceId,
    defaultValue,
    isActive,
    isCustom,
    isLabelSyncedWithName,
    isSystem,
    isUIReadOnly,
    options,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    description: description ?? undefined,
    icon: icon ?? undefined,
    standardOverrides: standardOverrides ?? undefined,
    isNullable: isNullable ?? false,
    isUnique: isUnique ?? false,
    settings: settings ?? undefined,
  };
};
