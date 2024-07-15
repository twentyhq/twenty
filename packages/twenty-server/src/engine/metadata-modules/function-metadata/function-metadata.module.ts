import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { SortDirection } from '@ptc-org/nestjs-query-core';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import { CodeEngineModule } from 'src/engine/core-modules/code-engine/code-engine.module';
import { FunctionMetadataService } from 'src/engine/metadata-modules/function-metadata/function-metadata.service';
import { FunctionMetadataResolver } from 'src/engine/metadata-modules/function-metadata/function-metadata.resolver';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { FunctionMetadataDTO } from 'src/engine/metadata-modules/function-metadata/dtos/function-metadata.dto';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        FileUploadModule,
        NestjsQueryTypeOrmModule.forFeature(
          [FunctionMetadataEntity],
          'metadata',
        ),
      ],
      services: [FunctionMetadataService],
      resolvers: [
        {
          EntityClass: FunctionMetadataEntity,
          DTOClass: FunctionMetadataDTO,
          ServiceClass: FunctionMetadataService,
          pagingStrategy: PagingStrategies.CURSOR,
          read: {
            defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
          },
          create: {
            // Manually created because of the async validation
            one: { disabled: true },
            many: { disabled: true },
          },
          update: {
            // Manually created because of the async validation
            one: { disabled: true },
            many: { disabled: true },
          },
          delete: { disabled: true },
          guards: [JwtAuthGuard],
        },
      ],
    }),
    CodeEngineModule,
  ],
  providers: [FunctionMetadataService, FunctionMetadataResolver],
  exports: [FunctionMetadataService],
})
export class FunctionMetadataModule {}
