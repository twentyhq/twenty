import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

export const computeObjectTargetTable = (
  objectMetadata: ObjectMetadataInterface,
) => {
  return computeCustomName(
    objectMetadata.nameSingular,
    objectMetadata.isCustom,
  );
};

export const computeCustomName = (name: string, isCustom: boolean) => {
  return isCustom ? `_${name}` : name;
};
