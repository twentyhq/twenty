import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';

export const fromFlatObjectMetadataToObjectMetadataDto = (
  flatObjectMetadata: FlatObjectMetadata,
): ObjectMetadataDTO => {
  const {
    createdAt,
    updatedAt,
    description,
    icon,
    standardOverrides,
    shortcut,
    duplicateCriteria,
    ...rest
  } = flatObjectMetadata;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    description: description ?? undefined,
    icon: icon ?? undefined,
    standardOverrides: standardOverrides ?? undefined,
    shortcut: shortcut ?? undefined,
    duplicateCriteria: duplicateCriteria ?? undefined,
  };
};
