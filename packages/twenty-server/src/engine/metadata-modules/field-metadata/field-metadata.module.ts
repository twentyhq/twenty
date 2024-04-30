import { Module } from '@nestjs/common';

import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { SortDirection } from '@ptc-org/nestjs-query-core';

import { WorkspaceMigrationRunnerModule } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.module';
import { WorkspaceMigrationModule } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { IsFieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-default-value.validator';
import { FieldMetadataResolver } from 'src/engine/metadata-modules/field-metadata/field-metadata.resolver';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { IsFieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-options.validator';

import { FieldMetadataService } from './field-metadata.service';
import { FieldMetadataEntity } from './field-metadata.entity';

import { CreateFieldInput } from './dtos/create-field.input';
import { UpdateFieldInput } from './dtos/update-field.input';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([FieldMetadataEntity], 'metadata'),
        WorkspaceMigrationModule,
        WorkspaceMigrationRunnerModule,
        ObjectMetadataModule,
        DataSourceModule,
        TypeORMModule,
      ],
      services: [IsFieldMetadataDefaultValue, FieldMetadataService],
      resolvers: [
        {
          EntityClass: FieldMetadataEntity,
          DTOClass: FieldMetadataDTO,
          CreateDTOClass: CreateFieldInput,
          UpdateDTOClass: UpdateFieldInput,
          ServiceClass: FieldMetadataService,
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
  ],
  providers: [
    IsFieldMetadataDefaultValue,
    IsFieldMetadataOptions,
    FieldMetadataService,
    FieldMetadataResolver,
  ],
  exports: [FieldMetadataService],
})
export class FieldMetadataModule {}
