import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { SortDirection } from '@ptc-org/nestjs-query-core';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessModule } from 'src/engine/integrations/serverless/serverless.module';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { ServerlessFunctionResolver } from 'src/engine/metadata-modules/serverless-function/serverless-function.resolver';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { ServerlessFunctionDTO } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function.dto';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

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
          guards: [JwtAuthGuard],
        },
      ],
    }),
    ServerlessModule,
  ],
  providers: [ServerlessFunctionService, ServerlessFunctionResolver],
  exports: [ServerlessFunctionService],
})
export class ServerlessFunctionModule {}
