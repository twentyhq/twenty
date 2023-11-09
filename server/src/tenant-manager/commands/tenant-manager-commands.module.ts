import { Module } from '@nestjs/common';

import { TenantManagerModule } from 'src/tenant-manager/tenant-manager.module';

import { SyncTenantMetadataCommand } from './sync-tenant-metadata.command';

@Module({
  imports: [TenantManagerModule],
  providers: [SyncTenantMetadataCommand],
})
export class TenantManagerCommandsModule {}
