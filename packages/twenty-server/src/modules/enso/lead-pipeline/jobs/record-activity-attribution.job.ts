import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type RecordActivityAttributionJobData } from 'src/modules/enso/lead-pipeline/jobs/lead-pipeline-job.types';
import { ConsentFromActivityService } from 'src/modules/enso/lead-pipeline/services/consent-from-activity.service';
import { PersonFirstTouchService } from 'src/modules/enso/lead-pipeline/services/person-first-touch.service';
import { PersonTimelineService } from 'src/modules/enso/lead-pipeline/services/person-timeline.service';

// What an inbound activity establishes about the PERSON: their frozen
// first-touch attribution, the touch on their timeline, and any consent the
// submission grants.
//
// This is deliberately its own job rather than the opening of the deal-
// resolution one. Attribution is a property of the activity: it is true the
// moment the call or submission lands, whether or not it goes on to become a
// deal. Living inside ResolveOpportunityFromActivityJob made it conditional on
// deal creation, so the two entry points that never reach that job — a
// department marked `lead: false`, and a call whose project could not be
// resolved — recorded nothing at all: no first touch, and no trace of the
// conversation on the contact's timeline. A project whose sales team works
// outside the CRM is exactly that case, so it was invisible in the CRM
// precisely where the CRM was supposed to be observing it.
//
// Every step is best-effort and self-guarding (each no-ops on an activity with
// no person, or a synthetic one), so this is safe to enqueue for any activity.
// It is NOT idempotent, though — the timeline insert has no dedup of its own —
// so every caller must enqueue it with a stable per-activity job id.
@Processor(MessageQueue.ensoLeadPipelineQueue)
export class RecordActivityAttributionJob {
  constructor(
    private readonly personFirstTouchService: PersonFirstTouchService,
    private readonly personTimelineService: PersonTimelineService,
    private readonly consentFromActivityService: ConsentFromActivityService,
  ) {}

  @Process(RecordActivityAttributionJob.name)
  async handle(data: RecordActivityAttributionJobData): Promise<void> {
    const { workspaceId, activityId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    // Freeze the person's first-touch attribution from the earliest activity
    // (runs for every activity, incl. organic/no-project).
    await this.personFirstTouchService.applyFromActivity(
      authContext,
      activityId,
    );
    // Surface the inbound activity on the person's timeline.
    await this.personTimelineService.recordInboundActivity(
      workspaceId,
      activityId,
    );
    // Establish per-project marketing consent from form-type inbounds
    // (social/calls grant no marketing consent).
    await this.consentFromActivityService.applyFromActivity(
      authContext,
      activityId,
    );
  }
}
