import { Controller, Get, UseGuards } from '@nestjs/common';

import { Workspace } from '@prisma/client';
import { EntitySchema } from 'typeorm';

import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { DataSourceMetadataService } from './data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from './entity-schema-generator/entity-schema-generator.service';
import { DataSourceService } from './data-source/data-source.service';
import { MigrationGeneratorService } from './migration-generator/migration-generator.service';
import { uuidToBase36 } from './data-source/data-source.util';

@UseGuards(JwtAuthGuard)
@Controller('metadata')
export class MetadataController {
  constructor(
    private readonly entitySchemaGeneratorService: EntitySchemaGeneratorService,
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly dataSourceService: DataSourceService,
    private readonly migrationGenerator: MigrationGeneratorService,
  ) {}

  @Get()
  async getMetadata(@AuthWorkspace() workspace: Workspace) {
    const dataSourcesMetadata =
      await this.dataSourceMetadataService.getDataSourcesMedataFromWorkspaceId(
        workspace.id,
      );

    const entities: EntitySchema<{
      id: unknown;
    }>[] = [];

    for (const dataSource of dataSourcesMetadata) {
      const dataSourceEntities =
        await this.entitySchemaGeneratorService.getTypeORMEntitiesByDataSourceId(
          dataSource.id,
        );

      entities.push(...dataSourceEntities);
    }

    return await this.migrationGenerator.executeMigrationFromPendingMigrations(
      workspace.id,
    );

    this.dataSourceService.createWorkspaceSchema(workspace.id);

    console.log('entities', uuidToBase36(workspace.id), workspace.id);

    this.dataSourceService.connectToWorkspaceDataSource(workspace.id);

    return entities;
  }
}
