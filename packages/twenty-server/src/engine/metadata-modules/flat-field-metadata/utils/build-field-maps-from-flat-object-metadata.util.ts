import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FieldMapsForObject = {
  fieldIdByName: Record<string, string>;
  fieldIdByJoinColumnName: Record<string, string>;
};

// Generic over the field shape (lite from the record query path, full from the metadata layer):
// only name, id and settings are read, all present in the lite projection.
export const buildFieldMapsFromFlatObjectMetadata = <
  T extends LiteFlatFieldMetadata = FlatFieldMetadata,
>(
  flatFieldMetadataMaps: FlatEntityMaps<T>,
  flatObjectMetadata: FlatObjectMetadata,
): FieldMapsForObject => {
  const fieldIdByName: Record<string, string> = {};
  const fieldIdByJoinColumnName: Record<string, string> = {};

  // The type guards below narrow on `type` and read `settings` — both core columns. Cast to the
  // full type so the guard narrowing applies; no dropped property is read.
  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ) as unknown as FlatFieldMetadata[];

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
