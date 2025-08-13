import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { getFlatFieldMetadataFromMapOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-flat-field-metadata-from-map-or-throw.util';
import { getFlatObjectMetadataFromMapOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-flat-object-metadata-from-map-or-throw.util';

import { getWorkspaceSchemaContextForMigration } from './get-workspace-schema-context-for-migration.util';

export interface WorkspaceSchemaContext {
  flatObjectMetadata: FlatObjectMetadataWithFlatFieldMaps;
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
  const flatObjectMetadata = getFlatObjectMetadataFromMapOrThrow(
    flatObjectMetadataMaps,
    objectMetadataId,
  );

  const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
    workspaceId: flatObjectMetadata.workspaceId,
    flatObjectMetadata,
  });

  return {
    flatObjectMetadata,
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
  const fieldMetadata = getFlatFieldMetadataFromMapOrThrow(
    flatObjectMetadataMaps,
    objectMetadataId,
    fieldMetadataId,
  );

  return {
    ...context,
    fieldMetadata,
  };
};
