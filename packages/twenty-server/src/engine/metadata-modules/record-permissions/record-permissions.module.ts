import { Module } from '@nestjs/common';

import { RecordPermissionsResolver } from 'src/engine/metadata-modules/record-permissions/record-permissions.resolver';
import { RecordPermissionsService } from 'src/engine/metadata-modules/record-permissions/services/record-permissions.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [RecordPermissionsService, RecordPermissionsResolver],
  exports: [RecordPermissionsService],
})
export class RecordPermissionsModule {}
