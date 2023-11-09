import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { SortDirection } from '@ptc-org/nestjs-query-core';

import { TenantMigrationRunnerModule } from 'src/tenant-migration-runner/tenant-migration-runner.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { FieldMetadataEntity } from 'src/database/typeorm/metadata/entities/field-metadata.entity';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { FieldMetadataService } from './field-metadata.service';

import { CreateFieldInput } from './dtos/create-field.input';
import { FieldMetadataDTO } from './dtos/field-metadata.dto';
import { UpdateFieldInput } from './dtos/update-field.input';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
        TenantMigrationModule,
        TenantMigrationRunnerModule,
        ObjectMetadataModule,
      ],
      services: [FieldMetadataService],
      resolvers: [
        {
          EntityClass: FieldMetadataEntity,
          DTOClass: FieldMetadataDTO,
          CreateDTOClass: CreateFieldInput,
          UpdateDTOClass: UpdateFieldInput,
          ServiceClass: FieldMetadataService,
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
  providers: [FieldMetadataService],
  exports: [FieldMetadataService],
})
export class FieldMetadataModule {}
