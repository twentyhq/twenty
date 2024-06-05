import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export const hasPositionField = (objectMetadataItem: ObjectMetadataInterface) =>
  ['opportunity', 'person', 'company'].includes(
    objectMetadataItem.nameSingular,
  ) || objectMetadataItem.isCustom;
