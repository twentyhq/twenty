import { Injectable } from '@nestjs/common';

import { GraphQLSchema } from 'graphql';

import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

import { SchemaBuilderService } from './schema-builder/schema-builder.service';

@Injectable()
export class TenantService {
  constructor(
    private readonly schemaBuilderService: SchemaBuilderService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  async createTenantSchema(workspaceId: string | undefined) {
    if (!workspaceId) {
      return new GraphQLSchema({});
    }

    const dataSourcesMetadata =
      await this.dataSourceMetadataService.getDataSourcesMetadataFromWorkspaceId(
        workspaceId,
      );

    // Can'f find any data sources for this workspace
    if (!dataSourcesMetadata || dataSourcesMetadata.length === 0) {
      return new GraphQLSchema({});
    }

    const dataSourceMetadata = dataSourcesMetadata[0];

    const objectMetadata =
      await this.objectMetadataService.getObjectMetadataFromDataSourceId(
        dataSourceMetadata.id,
      );

    return this.schemaBuilderService.generateSchema(
      workspaceId,
      objectMetadata,
    );
  }
}
