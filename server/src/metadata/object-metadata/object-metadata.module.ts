import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';
import { MigrationRunnerModule } from 'src/metadata/migration-runner/migration-runner.module';
import { TenantMigrationModule } from 'src/metadata/tenant-migration/tenant-migration.module';

import { ObjectMetadata } from './object-metadata.entity';
import { objectMetadataAutoResolverOpts } from './object-metadata.auto-resolver-opts';

import { ObjectMetadataService } from './services/object-metadata.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([ObjectMetadata], 'metadata'),
        DataSourceMetadataModule,
        TenantMigrationModule,
        MigrationRunnerModule,
      ],
      services: [ObjectMetadataService],
      resolvers: objectMetadataAutoResolverOpts,
    }),
  ],
  providers: [ObjectMetadataService],
  exports: [ObjectMetadataService],
})
export class ObjectMetadataModule {}
