import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataResolver } from 'src/engine/metadata-modules/index-metadata/index-metadata.resolver';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/services/index-metadata.service';
import { ObjectMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/object-metadata/interceptors/object-metadata-graphql-api-exception.interceptor';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceMigrationModule } from 'src/engine/workspace-manager/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndexMetadataEntity]),
    ApplicationModule,
    PermissionsModule,
    WorkspaceMigrationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([
          IndexMetadataEntity,
          IndexFieldMetadataEntity,
        ]),
      ],
      resolvers: [
        {
          EntityClass: IndexMetadataEntity,
          DTOClass: IndexMetadataDTO,
          read: {
            defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
            many: {
              name: 'indexMetadatas', //TODO: check + singular
            },
          },
          create: {
            disabled: true,
          },
          update: { disabled: true },
          delete: { disabled: true },
          guards: [WorkspaceAuthGuard],
          interceptors: [ObjectMetadataGraphqlApiExceptionInterceptor],
        },
      ],
    }),
  ],
  providers: [IndexMetadataResolver, IndexMetadataService],
  exports: [IndexMetadataService],
})
export class IndexMetadataModule {}
