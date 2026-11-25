import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { RecordPermissionsResolver } from 'src/engine/permissions/record-permissions/record-permissions.resolver';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, PermissionsModule],
  providers: [RecordPermissionsResolver],
})
export class RecordPermissionsModule {}
