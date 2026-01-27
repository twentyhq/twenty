import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isRelationNestedFieldDateKind = ({
  relationFieldMetadata,
  relationNestedFieldName,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relationFieldMetadata: FlatFieldMetadata;
  relationNestedFieldName: string | undefined;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): boolean => {
  if (!isDefined(relationNestedFieldName)) {
    return false;
  }

  if (!isMorphOrRelationFlatFieldMetadata(relationFieldMetadata)) {
    return false;
  }

  const targetObjectId = relationFieldMetadata.relationTargetObjectMetadataId;

  if (!isDefined(targetObjectId)) {
    return false;
  }

  const targetObjectMetadata = flatObjectMetadataMaps.byId[targetObjectId];

  if (!isDefined(targetObjectMetadata)) {
    return false;
  }

  const nestedFieldName = relationNestedFieldName.split('.')[0];

  const targetFieldIds = targetObjectMetadata.fieldIds;

  const nestedFieldMetadata = targetFieldIds
    .map((fieldId: string) => flatFieldMetadataMaps.byId[fieldId])
    .find(
      (fieldMetadata: FlatFieldMetadata | undefined) =>
        isDefined(fieldMetadata) && fieldMetadata.name === nestedFieldName,
    );

  if (!isDefined(nestedFieldMetadata)) {
    return false;
  }

  return isFieldMetadataDateKind(nestedFieldMetadata.type);
};
