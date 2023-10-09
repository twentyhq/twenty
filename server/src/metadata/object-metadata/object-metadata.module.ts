import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { ObjectMetadataService } from './object-metadata.service';
import { ObjectMetadata } from './object-metadata.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([ObjectMetadata], 'metadata'),
      ],
      resolvers: [
        {
          EntityClass: ObjectMetadata,
          DTOClass: ObjectMetadata,
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
  providers: [ObjectMetadataService],
  exports: [ObjectMetadataService],
})
export class ObjectMetadataModule {}
