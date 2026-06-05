import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { belongsToTwentyStandardApp } from 'src/engine/metadata-modules/utils/belongs-to-twenty-standard-app.util';

export const fromFlatObjectMetadataToObjectMetadataDto = (
  flatObjectMetadata: FlatObjectMetadata,
): ObjectMetadataDTO => {
  const {
    createdAt,
    updatedAt,
    color,
    description,
    icon,
    standardOverrides,
    shortcut,
    duplicateCriteria,
    id,
    universalIdentifier,
    isActive,
    isLabelSyncedWithName,
    isRemote,
    isSearchable,
    isSystem,
    isUIReadOnly,
    labelPlural,
    labelSingular,
    namePlural,
    nameSingular,
    workspaceId,
    imageIdentifierFieldMetadataId,
    labelIdentifierFieldMetadataId,
    applicationId,
  } = flatObjectMetadata;

  return {
    id,
    universalIdentifier,
    isActive,
    isCustom: !belongsToTwentyStandardApp(flatObjectMetadata),
    isLabelSyncedWithName,
    isRemote,
    isSearchable,
    isSystem,
    isUIReadOnly,
    labelPlural,
    labelSingular,
    namePlural,
    nameSingular,
    workspaceId,
    imageIdentifierFieldMetadataId,
    labelIdentifierFieldMetadataId,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    color: color ?? undefined,
    description: description ?? undefined,
    icon: icon ?? undefined,
    standardOverrides: standardOverrides ?? undefined,
    shortcut: shortcut ?? undefined,
    duplicateCriteria: duplicateCriteria ?? undefined,
    applicationId,
  };
};
