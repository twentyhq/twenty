import { Module } from '@nestjs/common';

import { TenantManagerModule } from 'src/tenant-manager/tenant-manager.module';
import { DataSourceMetadataModule } from 'src/metadata/data-source-metadata/data-source-metadata.module';

import { SyncTenantMetadataCommand } from './sync-tenant-metadata.command';

@Module({
  imports: [TenantManagerModule, DataSourceMetadataModule],
  providers: [SyncTenantMetadataCommand],
})
export class TenantManagerCommandsModule {}
