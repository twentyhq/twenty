import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/index-metadata.service';
import { ObjectMetadataGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/object-metadata/interceptors/object-metadata-graphql-api-exception.interceptor';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndexMetadataEntity], 'core'),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [IndexMetadataEntity, IndexFieldMetadataEntity],
          'core',
        ),
        WorkspaceMigrationModule,
      ],
      services: [IndexMetadataService],
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
  providers: [IndexMetadataService],
  exports: [IndexMetadataService],
})
export class IndexMetadataModule {}
