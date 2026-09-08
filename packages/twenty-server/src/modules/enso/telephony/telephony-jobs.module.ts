import { Module } from '@nestjs/common';

import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { InboundActivityNameService } from 'src/modules/enso/inbound-activity/services/inbound-activity-name.service';
import { ArchiveCallRecordingJob } from 'src/modules/enso/telephony/jobs/archive-call-recording.job';
import { DecideCallOutcomeJob } from 'src/modules/enso/telephony/jobs/decide-call-outcome.job';
import { IngestCallEventJob } from 'src/modules/enso/telephony/jobs/ingest-call-event.job';
import { CallFollowUpService } from 'src/modules/enso/telephony/services/call-follow-up.service';
import { CallIdentityService } from 'src/modules/enso/telephony/services/call-identity.service';
import { CallRecordingArchiveService } from 'src/modules/enso/telephony/services/call-recording-archive.service';
import { OutboundCallIngestService } from 'src/modules/enso/telephony/services/outbound-call-ingest.service';
import { PbxNumberService } from 'src/modules/enso/telephony/services/pbx-number.service';
import { CallIngestService } from 'src/modules/enso/telephony/services/call-ingest.service';

// WORKER side of telephony intake: the ingest job and the services it needs.
// Imported by JobsModule, which the queue worker loads — that is where the
// message-queue explorer discovers @Processor classes. InboundActivityNameService
// is re-provided here (rather than imported) because raw-ORM inserts bypass the
// create resolver, so the computed label has to be materialized by hand.
@Module({
  imports: [FileStorageModule, SecureHttpClientModule],
  providers: [
    CallFollowUpService,
    CallIngestService,
    OutboundCallIngestService,
    PbxNumberService,
    CallIdentityService,
    CallRecordingArchiveService,
    InboundActivityNameService,
    IngestCallEventJob,
    DecideCallOutcomeJob,
    ArchiveCallRecordingJob,
  ],
})
export class TelephonyJobsModule {}
