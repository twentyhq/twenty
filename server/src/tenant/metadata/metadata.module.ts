import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';

import { DataSourceModule } from './data-source/data-source.module';
import { DataSourceMetadataModule } from './data-source-metadata/data-source-metadata.module';
import { FieldMetadataModule } from './field-metadata/field-metadata.module';
import { ObjectMetadataModule } from './object-metadata/object-metadata.module';
import { EntitySchemaGeneratorModule } from './entity-schema-generator/entity-schema-generator.module';
import { DataSourceMetadata } from './data-source-metadata/data-source-metadata.entity';
import { FieldMetadata } from './field-metadata/field-metadata.entity';
import { ObjectMetadata } from './object-metadata/object-metadata.entity';

const typeORMFactory = async (
  environmentService: EnvironmentService,
): Promise<TypeOrmModuleOptions> => ({
  url: environmentService.getPGDatabaseUrl(),
  type: 'postgres',
  logging: false,
  schema: 'metadata',
  entities: [DataSourceMetadata, FieldMetadata, ObjectMetadata],
  synchronize: true,
});

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: typeORMFactory,
      inject: [EnvironmentService],
      name: 'metadata',
    }),
    DataSourceModule,
    DataSourceMetadataModule,
    FieldMetadataModule,
    ObjectMetadataModule,
    EntitySchemaGeneratorModule,
  ],
  providers: [MetadataService],
  exports: [MetadataService],
  controllers: [MetadataController],
})
export class MetadataModule {}
