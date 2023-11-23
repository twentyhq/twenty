import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriverConfig, YogaDriver } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

import { WorkspaceMigrationRunnerModule } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/metadata/workspace-migration/workspace-migration.module';

import { DataSourceModule } from './data-source/data-source.module';
import { FieldMetadataModule } from './field-metadata/field-metadata.module';
import { ObjectMetadataModule } from './object-metadata/object-metadata.module';
import { RelationMetadataModule } from './relation-metadata/relation-metadata.module';
@Module({
  imports: [
    GraphQLModule.forRoot<YogaDriverConfig>({
      context: ({ req }) => ({ req }),
      driver: YogaDriver,
      autoSchemaFile: true,
      include: [MetadataModule],
      resolvers: { JSON: GraphQLJSON },
      plugins: [],
      path: '/metadata',
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
