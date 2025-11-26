import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
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

    if (isMorphOrRelationFlatFieldMetadata(field)) {
      const joinColumnName = (
        field.settings as { joinColumnName?: string } | undefined
      )?.joinColumnName;

      if (joinColumnName) {
        fieldIdByJoinColumnName[joinColumnName] = field.id;
      }
    }
  }

  return {
    fieldIdByName,
    fieldIdByJoinColumnName,
  };
};
