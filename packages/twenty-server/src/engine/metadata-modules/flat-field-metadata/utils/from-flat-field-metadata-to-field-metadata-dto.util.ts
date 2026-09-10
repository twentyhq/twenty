import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

export const fromFlatFieldMetadataToFieldMetadataDto = (
  flatFieldMetadata: FlatFieldMetadata,
): FieldMetadataDTO => {
  const {
    createdAt,
    updatedAt,
    description,
    icon,
    overrides,
    isNullable,
    isUnique,
    isSearchable,
    settings,
    id,
    universalIdentifier,
    label,
    name,
    objectMetadataId,
    type,
    workspaceId,
    defaultValue,
    isLabelSyncedWithName,
    isSystem,
    isUIEditable,
    writability,
    options,
    morphId,
    applicationId,
  } = flatFieldMetadata;

  return {
    id,
    universalIdentifier,
    label,
    name,
    objectMetadataId,
    type,
    workspaceId,
    defaultValue,
    isActive: resolveEffectiveFlatEntityProperty({
      metadataName: 'fieldMetadata',
      flatEntity: flatFieldMetadata,
      property: 'isActive',
    }),
    isLabelSyncedWithName,
    isSystem,
    isUIEditable,
    isUIReadOnly: !isUIEditable,
    writability,
    options,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    description: description ?? undefined,
    icon: icon ?? undefined,
    overrides: overrides ?? undefined,
    isNullable: isNullable ?? false,
    isUnique: isUnique ?? false,
    isSearchable: isSearchable ?? false,
    settings: settings ?? undefined,
    morphId: morphId ?? undefined,
    applicationId: applicationId ?? undefined,
  };
};
