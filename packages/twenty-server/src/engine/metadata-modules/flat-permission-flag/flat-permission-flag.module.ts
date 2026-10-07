import { Module } from '@nestjs/common';

import { WorkspaceFlatPermissionFlagMapCacheService } from 'src/engine/metadata-modules/flat-permission-flag/services/workspace-flat-permission-flag-map-cache.service';

@Module({
  providers: [WorkspaceFlatPermissionFlagMapCacheService],
  exports: [WorkspaceFlatPermissionFlagMapCacheService],
})
export class FlatPermissionFlagModule {}
