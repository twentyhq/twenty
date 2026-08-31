import { isDefined } from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const areFlatFieldMetadatasInSameRelationGroup = ({
  firstFlatFieldMetadata,
  secondFlatFieldMetadata,
}: {
  firstFlatFieldMetadata: OrmFlatFieldMetadata;
  secondFlatFieldMetadata: OrmFlatFieldMetadata;
}) =>
  firstFlatFieldMetadata.id === secondFlatFieldMetadata.id ||
  (isDefined(firstFlatFieldMetadata.morphId) &&
    firstFlatFieldMetadata.morphId === secondFlatFieldMetadata.morphId &&
    firstFlatFieldMetadata.objectMetadataId ===
      secondFlatFieldMetadata.objectMetadataId);
