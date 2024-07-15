import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { SortDirection } from '@ptc-org/nestjs-query-core';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FunctionMetadataEntity } from 'src/engine/metadata-modules/function-metadata/function-metadata.entity';
import { CustomCodeEngineModule } from 'src/engine/core-modules/custom-code-engine/custom-code-engine.module';
import { FunctionMetadataService } from 'src/engine/metadata-modules/function-metadata/function-metadata.service';
import { FunctionMetadataResolver } from 'src/engine/metadata-modules/function-metadata/function-metadata.resolver';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { FunctionMetadataDTO } from 'src/engine/metadata-modules/function-metadata/dtos/function-metadata.dto';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
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
    CustomCodeEngineModule,
  ],
  providers: [FunctionMetadataService, FunctionMetadataResolver],
  exports: [FunctionMetadataService],
})
export class FunctionMetadataModule {}
