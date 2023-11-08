import { Module } from '@nestjs/common';

import { MetadataModule } from 'src/metadata/metadata.module';
import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';

import { TenantService } from './tenant.service';

import { SchemaBuilderModule } from './schema-builder/schema-builder.module';
import { ResolverBuilderModule } from './resolver-builder/resolver-builder.module';

@Module({
  imports: [
    MetadataModule,
    DataSourceMetadataModule,
    ObjectMetadataModule,
    SchemaBuilderModule,
    ResolverBuilderModule,
  ],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
