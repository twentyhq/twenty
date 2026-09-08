import { Module } from '@nestjs/common';

import { RebuildOwnerRecordSharesJob } from 'src/engine/record-share/jobs/rebuild-owner-record-shares.job';
import { RecalculateSharingRuleRecordSharesJob } from 'src/engine/record-share/jobs/recalculate-sharing-rule-record-shares.job';
import { OwnerFieldMetadataEventListener } from 'src/engine/record-share/listeners/owner-field-metadata-event.listener';
import { SharingRuleMetadataEventListener } from 'src/engine/record-share/listeners/sharing-rule-metadata-event.listener';
import { SharingRuleRecordEventListener } from 'src/engine/record-share/listeners/sharing-rule-record-event.listener';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { ShareWithService } from 'src/engine/record-share/services/share-with.service';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [TwentyOrmModule, WorkspaceCacheModule],
  providers: [
    RecordShareService,
    ShareWithService,
    RecalculateSharingRuleRecordSharesJob,
    RebuildOwnerRecordSharesJob,
    OwnerFieldMetadataEventListener,
    SharingRuleMetadataEventListener,
    SharingRuleRecordEventListener,
  ],
  exports: [RecordShareService, ShareWithService],
})
export class RecordShareModule {}
