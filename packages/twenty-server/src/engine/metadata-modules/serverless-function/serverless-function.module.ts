import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SortDirection } from '@ptc-org/nestjs-query-core';
import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { ServerlessModule } from 'src/engine/core-modules/serverless/serverless.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionResolver } from 'src/engine/metadata-modules/serverless-function/serverless-function.resolver';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        FileUploadModule,
        NestjsQueryTypeOrmModule.forFeature(
          [ServerlessFunctionEntity],
          'metadata',
        ),
        TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
        FileModule,
        ThrottlerModule,
      ],
      services: [ServerlessFunctionService],
      resolvers: [
        {
          EntityClass: ServerlessFunctionEntity,
          DTOClass: ServerlessFunctionDTO,
          ServiceClass: ServerlessFunctionService,
          pagingStrategy: PagingStrategies.CURSOR,
          read: {
            defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
          },
          create: { disabled: true },
          update: { disabled: true },
          delete: { disabled: true },
          guards: [WorkspaceAuthGuard],
        },
      ],
    }),
    ServerlessModule,
  ],
  providers: [ServerlessFunctionService, ServerlessFunctionResolver],
  exports: [ServerlessFunctionService],
})
export class ServerlessFunctionModule {}
