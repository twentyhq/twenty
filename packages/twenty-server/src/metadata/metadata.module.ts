import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriverConfig, YogaDriver } from '@graphql-yoga/nestjs';

import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';
import { metadataModuleFactory } from 'src/metadata/metadata.module-factory';

import { DataSourceModule } from './data-source/data-source.module';
import { FieldMetadataModule } from './field-metadata/field-metadata.module';
import { ObjectMetadataModule } from './object-metadata/object-metadata.module';
import { RelationMetadataModule } from './relation-metadata/relation-metadata.module';
@Module({
  imports: [
    GraphQLModule.forRootAsync<YogaDriverConfig>({
      driver: YogaDriver,
      imports: [],
      useFactory: metadataModuleFactory,
    }),
    DataSourceModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    WorkspaceMigrationRunnerModule,
    WorkspaceMigrationModule,
    RelationMetadataModule,
  ],
})
export class MetadataModule {}
