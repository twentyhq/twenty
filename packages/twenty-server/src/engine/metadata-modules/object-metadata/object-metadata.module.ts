import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { BeforeUpdateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-update-one-object.hook';
import { ObjectMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/object-metadata/interceptors/object-metadata-graphql-api-exception.interceptor';
import { ObjectMetadataResolver } from 'src/engine/metadata-modules/object-metadata/object-metadata.resolver';
import { ObjectMetadataMigrationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-migration.service';
import { ObjectMetadataRelatedRecordsService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-related-records.service';
import { ObjectMetadataRelationService } from 'src/engine/metadata-modules/object-metadata/services/object-metadata-relation.service';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RemoteTableRelationsModule } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/remote-table-relations.module';
import { SearchModule } from 'src/engine/metadata-modules/search/search.module';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

import { ObjectMetadataEntity } from './object-metadata.entity';
import { ObjectMetadataService } from './object-metadata.service';

import { CreateObjectInput } from './dtos/create-object.input';
import { ObjectMetadataDTO } from './dtos/object-metadata.dto';
import { UpdateObjectPayload } from './dtos/update-object.input';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        TypeORMModule,
        NestjsQueryTypeOrmModule.forFeature(
          [ObjectMetadataEntity, FieldMetadataEntity, RelationMetadataEntity],
          'metadata',
        ),
        TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
        DataSourceModule,
        WorkspaceMigrationModule,
        WorkspaceMigrationRunnerModule,
        WorkspaceMetadataVersionModule,
        RemoteTableRelationsModule,
        SearchModule,
        IndexMetadataModule,
      ],
      services: [
        ObjectMetadataService,
        ObjectMetadataMigrationService,
        ObjectMetadataRelationService,
        ObjectMetadataRelatedRecordsService,
      ],
      resolvers: [
        {
          EntityClass: ObjectMetadataEntity,
          DTOClass: ObjectMetadataDTO,
          CreateDTOClass: CreateObjectInput,
          UpdateDTOClass: UpdateObjectPayload,
          ServiceClass: ObjectMetadataService,
          pagingStrategy: PagingStrategies.CURSOR,
          read: {
            defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
          },
          create: {
            many: { disabled: true },
          },
          update: { disabled: true },
          delete: { disabled: true },
          guards: [WorkspaceAuthGuard],
          interceptors: [ObjectMetadataGraphqlApiExceptionInterceptor],
        },
      ],
    }),
  ],
  providers: [
    ObjectMetadataService,
    ObjectMetadataResolver,
    BeforeUpdateOneObject,
  ],
  exports: [ObjectMetadataService],
})
export class ObjectMetadataModule {}
