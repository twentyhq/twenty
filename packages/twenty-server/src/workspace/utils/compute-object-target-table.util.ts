import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

export const computeObjectTargetTable = (
  objectMetadata: ObjectMetadataInterface,
) => {
  const prefix = objectMetadata.isCustom ? '_' : '';

  return `${prefix}${objectMetadata.nameSingular}`;
};
