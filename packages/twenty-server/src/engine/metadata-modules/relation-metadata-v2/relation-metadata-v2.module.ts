import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { RelationMetadataGraphqlApiExceptionV2Interceptor } from 'src/engine/metadata-modules/relation-metadata-v2/interceptors/relation-metadata-graphql-api-exception-v2.interceptor';
import { RelationMetadataV2Resolver } from 'src/engine/metadata-modules/relation-metadata-v2/relation-metadata-v2.resolver';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

import { RelationMetadataV2Entity } from './relation-metadata-v2.entity';
import { RelationMetadataV2Service } from './relation-metadata-v2.service';

import { CreateRelationV2Input } from './dtos/create-relation-v2.input';
import { RelationMetadataV2DTO } from './dtos/relation-metadata-v2.dto';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [RelationMetadataV2Entity, FieldMetadataEntity],
          'metadata',
        ),
        ObjectMetadataModule,
        FieldMetadataModule,
        IndexMetadataModule,
        WorkspaceMigrationRunnerModule,
        WorkspaceMigrationModule,
        WorkspaceCacheStorageModule,
        WorkspaceMetadataVersionModule,
      ],
      services: [RelationMetadataV2Service],
      resolvers: [
        {
          EntityClass: RelationMetadataV2Entity,
          DTOClass: RelationMetadataV2DTO,
          ServiceClass: RelationMetadataV2Service,
          CreateDTOClass: CreateRelationV2Input,
          pagingStrategy: PagingStrategies.CURSOR,
          create: { many: { disabled: true } },
          update: { disabled: true },
          delete: { disabled: true },
          guards: [WorkspaceAuthGuard],
          interceptors: [RelationMetadataGraphqlApiExceptionV2Interceptor],
        },
      ],
    }),
  ],
  providers: [RelationMetadataV2Service, RelationMetadataV2Resolver],
  exports: [RelationMetadataV2Service],
})
export class RelationMetadataV2Module {}
