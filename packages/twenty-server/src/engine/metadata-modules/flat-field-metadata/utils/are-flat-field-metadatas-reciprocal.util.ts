import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const areFlatFieldMetadatasReciprocal = ({
  firstFlatFieldMetadata,
  secondFlatFieldMetadata,
}: {
  firstFlatFieldMetadata: OrmFlatFieldMetadata;
  secondFlatFieldMetadata: OrmFlatFieldMetadata;
}) =>
  firstFlatFieldMetadata.relationTargetObjectMetadataId ===
    secondFlatFieldMetadata.objectMetadataId &&
  firstFlatFieldMetadata.relationTargetFieldMetadataId ===
    secondFlatFieldMetadata.id &&
  secondFlatFieldMetadata.relationTargetObjectMetadataId ===
    firstFlatFieldMetadata.objectMetadataId &&
  secondFlatFieldMetadata.relationTargetFieldMetadataId ===
    firstFlatFieldMetadata.id;
