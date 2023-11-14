import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { SortDirection } from '@ptc-org/nestjs-query-core';

import { DataSourceModule } from 'src/metadata/data-source/data-source.module';
import { TenantMigrationRunnerModule } from 'src/tenant-migration-runner/tenant-migration-runner.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { ObjectMetadataService } from './object-metadata.service';
import { ObjectMetadataEntity } from './object-metadata.entity';

import { CreateObjectInput } from './dtos/create-object.input';
import { UpdateObjectInput } from './dtos/update-object.input';
import { ObjectMetadataDTO } from './dtos/object-metadata.dto';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
        DataSourceModule,
        TenantMigrationModule,
        TenantMigrationRunnerModule,
      ],
      services: [ObjectMetadataService],
      resolvers: [
        {
          EntityClass: ObjectMetadataEntity,
          DTOClass: ObjectMetadataDTO,
          CreateDTOClass: CreateObjectInput,
          UpdateDTOClass: UpdateObjectInput,
          ServiceClass: ObjectMetadataService,
          enableTotalCount: true,
          pagingStrategy: PagingStrategies.CURSOR,
          read: {
            defaultSort: [{ field: 'id', direction: SortDirection.DESC }],
          },
          create: {
            many: { disabled: true },
          },
          update: {
            many: { disabled: true },
          },
          delete: { many: { disabled: true } },
          guards: [JwtAuthGuard],
        },
      ],
    }),
  ],
  providers: [ObjectMetadataService],
  exports: [ObjectMetadataService],
})
export class ObjectMetadataModule {}
