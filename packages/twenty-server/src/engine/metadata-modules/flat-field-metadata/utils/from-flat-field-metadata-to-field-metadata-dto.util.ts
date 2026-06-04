import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isTwentyStandardApplicationUniversalIdentifier } from 'src/engine/metadata-modules/utils/is-twenty-standard-application-universal-identifier.util';

export const fromFlatFieldMetadataToFieldMetadataDto = (
  flatFieldMetadata: FlatFieldMetadata,
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
    universalIdentifier,
    label,
    name,
    objectMetadataId,
    type,
    workspaceId,
    defaultValue,
    isActive,
    isLabelSyncedWithName,
    isSystem,
    isUIReadOnly,
    options,
    morphId,
    applicationId,
    applicationUniversalIdentifier,
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
    isActive,
    isCustom: !isTwentyStandardApplicationUniversalIdentifier(
      applicationUniversalIdentifier,
    ),
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
    morphId: morphId ?? undefined,
    applicationId: applicationId ?? undefined,
  };
};
