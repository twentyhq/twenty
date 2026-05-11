import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FieldMapsForObject = {
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
};

export const buildFieldMapsFromFlatObjectMetadata = (
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  flatObjectMetadata: FlatObjectMetadata,
): FieldMapsForObject => {
  const fieldIdByName: Record<string, string> = {};
  const fieldIdByJoinColumnName: Record<string, string> = {};

  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  for (const field of objectFields) {
    fieldIdByName[field.name] = field.id;

    if (
      (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
        isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)) &&
      field.settings.relationType === RelationType.MANY_TO_ONE
    ) {
      const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
        name: field.name,
      });

      fieldIdByJoinColumnName[joinColumnName] = field.id;
    }
  }

  return {
    fieldIdByName,
    fieldIdByJoinColumnName,
  };
};
