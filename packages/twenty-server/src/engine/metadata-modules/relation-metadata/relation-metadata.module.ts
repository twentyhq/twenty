import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { SettingsFeatures } from 'twenty-shared';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataModule } from 'src/engine/metadata-modules/field-metadata/field-metadata.module';
import { IndexMetadataModule } from 'src/engine/metadata-modules/index-metadata/index-metadata.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { RelationMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/relation-metadata/interceptors/relation-metadata-graphql-api-exception.interceptor';
import { RelationMetadataResolver } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.resolver';
import { WorkspaceMetadataVersionModule } from 'src/engine/metadata-modules/workspace-metadata-version/workspace-metadata-version.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';

import { RelationMetadataEntity } from './relation-metadata.entity';
import { RelationMetadataService } from './relation-metadata.service';

import { CreateRelationInput } from './dtos/create-relation.input';
import { RelationMetadataDTO } from './dtos/relation-metadata.dto';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [RelationMetadataEntity, FieldMetadataEntity],
          'metadata',
        ),
        ObjectMetadataModule,
        FieldMetadataModule,
        IndexMetadataModule,
        WorkspaceMigrationRunnerModule,
        WorkspaceMigrationModule,
        WorkspaceCacheStorageModule,
        WorkspaceMetadataVersionModule,
        FeatureFlagModule,
        PermissionsModule,
      ],
      services: [RelationMetadataService],
      resolvers: [
        {
          EntityClass: RelationMetadataEntity,
          DTOClass: RelationMetadataDTO,
          ServiceClass: RelationMetadataService,
          CreateDTOClass: CreateRelationInput,
          pagingStrategy: PagingStrategies.CURSOR,
          create: {
            many: { disabled: true },
            guards: [SettingsPermissionsGuard(SettingsFeatures.DATA_MODEL)],
          },
          update: { disabled: true },
          delete: { disabled: true },
          guards: [WorkspaceAuthGuard],
          interceptors: [RelationMetadataGraphqlApiExceptionInterceptor],
          filters: [PermissionsGraphqlApiExceptionFilter],
        },
      ],
    }),
  ],
  providers: [RelationMetadataService, RelationMetadataResolver],
  exports: [RelationMetadataService],
})
export class RelationMetadataModule {}
