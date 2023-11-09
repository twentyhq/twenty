import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { FieldMetadataModule } from 'src/metadata/field-metadata/field-metadata.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { MigrationRunnerModule } from 'src/metadata/migration-runner/migration-runner.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';

import { RelationMetadata } from './relation-metadata.entity';
import { relationMetadataAutoResolverOpts } from './relation-metadata.auto-resolver-opts';

import { RelationMetadataService } from './services/relation-metadata.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([RelationMetadata], 'metadata'),
        ObjectMetadataModule,
        FieldMetadataModule,
        MigrationRunnerModule,
        TenantMigrationModule,
      ],
      services: [RelationMetadataService],
      resolvers: relationMetadataAutoResolverOpts,
    }),
  ],
  providers: [RelationMetadataService],
  exports: [RelationMetadataService],
})
export class RelationMetadataModule {}
