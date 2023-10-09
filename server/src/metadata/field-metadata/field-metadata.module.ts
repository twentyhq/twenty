import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { FieldMetadataService } from './field-metadata.service';
import { FieldMetadata } from './field-metadata.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([FieldMetadata], 'metadata'),
      ],
      resolvers: [
        {
          EntityClass: FieldMetadata,
          DTOClass: FieldMetadata,
          enableTotalCount: true,
          pagingStrategy: PagingStrategies.CURSOR,
          create: { disabled: true },
          update: { disabled: true },
          delete: { disabled: true },
          guards: [JwtAuthGuard],
        },
      ],
    }),
  ],
  providers: [FieldMetadataService],
  exports: [FieldMetadataService],
})
export class FieldMetadataModule {}
