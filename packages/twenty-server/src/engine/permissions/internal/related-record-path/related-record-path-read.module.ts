import { Module } from '@nestjs/common';

import { RelatedRecordPathReadService } from 'src/engine/permissions/internal/related-record-path/services/related-record-path-read.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [RelatedRecordPathReadService],
  exports: [RelatedRecordPathReadService],
})
export class RelatedRecordPathReadModule {}
