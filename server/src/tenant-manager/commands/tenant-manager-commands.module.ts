import { Module } from '@nestjs/common';

import { TenantManagerModule } from 'src/tenant-manager/tenant-manager.module';
import { DataSourceModule } from 'src/metadata/data-source/data-source.module';

import { SyncTenantMetadataCommand } from './sync-tenant-metadata.command';

@Module({
  imports: [TenantManagerModule, DataSourceModule],
  providers: [SyncTenantMetadataCommand],
})
export class TenantManagerCommandsModule {}
