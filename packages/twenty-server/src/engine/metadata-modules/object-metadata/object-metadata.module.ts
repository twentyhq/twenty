import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { SortDirection } from '@ptc-org/nestjs-query-core';

import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { ObjectMetadataResolver } from 'src/engine/metadata-modules/object-metadata/object-metadata.resolver';

import { ObjectMetadataService } from './object-metadata.service';
import { ObjectMetadataEntity } from './object-metadata.entity';

import { CreateObjectInput } from './dtos/create-object.input';
import { UpdateObjectInput } from './dtos/update-object.input';
import { ObjectMetadataDTO } from './dtos/object-metadata.dto';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        TypeORMModule,
        NestjsQueryTypeOrmModule.forFeature(
          [ObjectMetadataEntity, FieldMetadataEntity, RelationMetadataEntity],
          'metadata',
        ),
        DataSourceModule,
        WorkspaceMigrationModule,
        WorkspaceMigrationRunnerModule,
      ],
      services: [ObjectMetadataService],
      resolvers: [
        {
          EntityClass: ObjectMetadataEntity,
          DTOClass: ObjectMetadataDTO,
          CreateDTOClass: CreateObjectInput,
          UpdateDTOClass: UpdateObjectInput,
          ServiceClass: ObjectMetadataService,
          pagingStrategy: PagingStrategies.CURSOR,
          read: {
            defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
          },
          create: {
            many: { disabled: true },
          },
          update: {
            many: { disabled: true },
          },
          delete: { disabled: true },
          guards: [JwtAuthGuard],
        },
      ],
    }),
  ],
  providers: [ObjectMetadataService, ObjectMetadataResolver],
  exports: [ObjectMetadataService],
})
export class ObjectMetadataModule {}
