import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';
import { typeORMMetadataModuleOptions } from './metadata.datasource';

import { DataSourceModule } from './data-source/data-source.module';
import { DataSourceMetadataModule } from './data-source-metadata/data-source-metadata.module';
import { FieldMetadataModule } from './field-metadata/field-metadata.module';
import { ObjectMetadataModule } from './object-metadata/object-metadata.module';
import { EntitySchemaGeneratorModule } from './entity-schema-generator/entity-schema-generator.module';
import { MigrationGeneratorModule } from './migration-generator/migration-generator.module';

const typeORMFactory = async (): Promise<TypeOrmModuleOptions> => ({
  ...typeORMMetadataModuleOptions,
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
  ],
  providers: [MetadataService],
  exports: [MetadataService],
  controllers: [MetadataController],
})
export class MetadataModule {}
