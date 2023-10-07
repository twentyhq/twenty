import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';

import { YogaDriverConfig, YogaDriver } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

import { MigrationGeneratorModule } from 'src/metadata/migration-generator/migration-generator.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';

import { MetadataService } from './metadata.service';
import { typeORMMetadataModuleOptions } from './metadata.datasource';
import { MetadataResolver } from './metadata.resolver';

import { DataSourceModule } from './data-source/data-source.module';
import { DataSourceMetadataModule } from './data-source-metadata/data-source-metadata.module';
import { FieldMetadataModule } from './field-metadata/field-metadata.module';
import { ObjectMetadataModule } from './object-metadata/object-metadata.module';

const typeORMFactory = async (): Promise<TypeOrmModuleOptions> => ({
  ...typeORMMetadataModuleOptions,
  name: 'metadata',
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: typeORMFactory,
      name: 'metadata',
    }),
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
    DataSourceMetadataModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    MigrationGeneratorModule,
    TenantMigrationModule,
  ],
  providers: [MetadataService, MetadataResolver],
  exports: [MetadataService],
})
export class MetadataModule {}
