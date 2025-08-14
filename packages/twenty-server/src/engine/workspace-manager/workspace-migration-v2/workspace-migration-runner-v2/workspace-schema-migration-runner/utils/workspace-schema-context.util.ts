import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-with-flat-field-maps-in-flat-object-metadata-maps-or-throw.util';

import { getWorkspaceSchemaContextForMigration } from './get-workspace-schema-context-for-migration.util';

export interface WorkspaceSchemaContext {
  flatObjectMetadataWithFlatFieldMaps: FlatObjectMetadataWithFlatFieldMaps;
  schemaName: string;
  tableName: string;
}

export const prepareWorkspaceSchemaContext = ({
  flatObjectMetadataMaps,
  objectMetadataId,
}: {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  objectMetadataId: string;
}): WorkspaceSchemaContext => {
  const flatObjectMetadataWithFlatFieldMaps =
    findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow({
      flatObjectMetadataMaps,
      objectMetadataId,
    });

  const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
    workspaceId: flatObjectMetadataWithFlatFieldMaps.workspaceId,
    flatObjectMetadataWithoutFields: flatObjectMetadataWithFlatFieldMaps,
  });

  return {
    flatObjectMetadataWithFlatFieldMaps,
    schemaName,
    tableName,
  };
};

export const prepareFieldWorkspaceSchemaContext = ({
  flatObjectMetadataMaps,
  objectMetadataId,
  fieldMetadataId,
}: {
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
  objectMetadataId: string;
  fieldMetadataId: string;
}): WorkspaceSchemaContext & { fieldMetadata: FlatFieldMetadata } => {
  const context = prepareWorkspaceSchemaContext({
    flatObjectMetadataMaps,
    objectMetadataId,
  });
  const fieldMetadata = findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
    flatObjectMetadataMaps,
    objectMetadataId,
    fieldMetadataId,
  });

  return {
    ...context,
    fieldMetadata,
  };
};
