import { Module } from '@nestjs/common';

import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { ShareWithService } from 'src/engine/record-share/services/share-with.service';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [TwentyOrmModule, WorkspaceCacheModule],
  providers: [RecordShareService, ShareWithService],
  exports: [RecordShareService, ShareWithService],
})
export class RecordShareModule {}
