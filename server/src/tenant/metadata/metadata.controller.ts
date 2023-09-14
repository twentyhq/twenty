import { Controller, Get, UseGuards } from '@nestjs/common';

import { Workspace } from '@prisma/client';
import { EntitySchema } from 'typeorm';

import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { DataSourceMetadataService } from './data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from './entity-schema-generator/entity-schema-generator.service';
import { DataSourceService } from './data-source/data-source.service';

@UseGuards(JwtAuthGuard)
@Controller('metadata')
export class MetadataController {
  constructor(
    private readonly entitySchemaGeneratorService: EntitySchemaGeneratorService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly dataSourceService: DataSourceService,
  ) {}

  @Get()
  async getMetadata(@AuthWorkspace() workspace: Workspace) {
    const dataSources =
      await this.dataSourceMetadataService.getDataSourcesMedataFromWorkspaceId(
        workspace.id,
      );

    const entities: EntitySchema<{
      id: unknown;
    }>[] = [];

    for (const dataSource of dataSources) {
      const dataSourceEntities =
        await this.entitySchemaGeneratorService.getTypeORMEntitiesByDataSourceId(
          dataSource.id,
        );

      entities.push(...dataSourceEntities);
    }

    // TODO: Only for test purposes should be removed
    this.dataSourceService.createWorkspaceSchema(workspace.id);

    this.dataSourceService.connectToWorkspaceDataSource(workspace.id);

    return entities;
  }
}
