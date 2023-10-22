import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { MigrationRunnerModule } from 'src/metadata/migration-runner/migration-runner.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';

import { FieldMetadata } from './field-metadata.entity';
import { fieldMetadataAutoResolverOpts } from './field-metadata.auto-resolver-opts';

import { FieldMetadataService } from './services/field-metadata.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([FieldMetadata], 'metadata'),
        TenantMigrationModule,
        MigrationRunnerModule,
        ObjectMetadataModule,
      ],
      services: [FieldMetadataService],
      resolvers: fieldMetadataAutoResolverOpts,
    }),
  ],
  providers: [FieldMetadataService],
  exports: [FieldMetadataService],
})
export class FieldMetadataModule {}
