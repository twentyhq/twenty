import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { typeORMMetadataModuleOptions } from './metadata.datasource';
import { MetadataResolver } from './metadata.resolver';

import { DataSourceModule } from './data-source/data-source.module';
import { DataSourceMetadataModule } from './data-source-metadata/data-source-metadata.module';
import { FieldMetadataModule } from './field-metadata/field-metadata.module';
import { ObjectMetadataModule } from './object-metadata/object-metadata.module';
import { EntitySchemaGeneratorModule } from './entity-schema-generator/entity-schema-generator.module';
import { MigrationGeneratorModule } from './migration-generator/migration-generator.module';
import { TenantMigrationModule } from './tenant-migration/tenant-migration.module';

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
    DataSourceModule,
    DataSourceMetadataModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    EntitySchemaGeneratorModule,
    MigrationGeneratorModule,
    TenantMigrationModule,
  ],
  providers: [MetadataService, MetadataResolver],
  exports: [MetadataService],
  controllers: [MetadataController],
})
export class MetadataModule {}
