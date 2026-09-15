import { Module } from '@nestjs/common';

import { RecordAccessPolicyService } from 'src/engine/record-share/services/record-access-policy.service';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { ShareWithService } from 'src/engine/record-share/services/share-with.service';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [TwentyOrmModule, WorkspaceCacheModule],
  providers: [RecordShareService, ShareWithService, RecordAccessPolicyService],
  exports: [RecordShareService, ShareWithService, RecordAccessPolicyService],
})
export class RecordShareModule {}
