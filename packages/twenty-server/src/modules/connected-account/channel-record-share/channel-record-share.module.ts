import { Module } from '@nestjs/common';

import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';
import { ChannelRecordShareService } from 'src/modules/connected-account/channel-record-share/services/channel-record-share.service';

@Module({
  imports: [TwentyOrmModule, WorkspaceCacheModule],
  providers: [ChannelRecordShareService],
  exports: [ChannelRecordShareService],
})
export class ChannelRecordShareModule {}
