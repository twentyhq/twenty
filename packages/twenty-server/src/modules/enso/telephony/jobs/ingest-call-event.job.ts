import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ArchiveCallRecordingJob } from 'src/modules/enso/telephony/jobs/archive-call-recording.job';
import { DecideCallOutcomeJob } from 'src/modules/enso/telephony/jobs/decide-call-outcome.job';
import {
  type ArchiveCallRecordingJobData,
  type DecideCallOutcomeJobData,
  deserializeCallEvent,
  type IngestCallEventJobData,
} from 'src/modules/enso/telephony/jobs/telephony-job.types';
import { type RecordActivityAttributionJobData } from 'src/modules/enso/lead-pipeline/jobs/lead-pipeline-job.types';
import { RecordActivityAttributionJob } from 'src/modules/enso/lead-pipeline/jobs/record-activity-attribution.job';
import { CallFollowUpService } from 'src/modules/enso/telephony/services/call-follow-up.service';
import { CallIdentityService } from 'src/modules/enso/telephony/services/call-identity.service';
import { OutboundCallIngestService } from 'src/modules/enso/telephony/services/outbound-call-ingest.service';
import { PbxNumberService } from 'src/modules/enso/telephony/services/pbx-number.service';
import {
  ANSWERED_CALL_STATUSES,
  ARCHIVE_RECORDINGS,
  CALL_OUTCOME_SETTLE_MS,
  isPbxTransferFallbackGroup,
  RECORDING_INITIAL_DELAY_MS,
} from 'src/modules/enso/telephony/telephony.constants';
import { CallIngestService } from 'src/modules/enso/telephony/services/call-ingest.service';
import { type NormalizedCallEvent } from 'src/modules/enso/telephony/types/telephony.types';

// Telephony intake runs off the queue rather than inline in the controller: the
// PBX and Roistat both expect a fast ack, and a slow response to the PBX sits in
// the path of a live call. The controller validates and enqueues; all database
// work happens here so a retry is cheap and independent.
@Processor(MessageQueue.ensoTelephonyQueue)
export class IngestCallEventJob {
  private readonly logger = new Logger(IngestCallEventJob.name);

  constructor(
    private readonly callIngestService: CallIngestService,
    private readonly outboundCallIngestService: OutboundCallIngestService,
    private readonly callIdentityService: CallIdentityService,
    private readonly pbxNumberService: PbxNumberService,
    private readonly callFollowUpService: CallFollowUpService,
    @InjectMessageQueue(MessageQueue.ensoTelephonyQueue)
    private readonly telephonyQueueService: MessageQueueService,
    @InjectMessageQueue(MessageQueue.ensoLeadPipelineQueue)
    private readonly leadPipelineQueueService: MessageQueueService,
  ) {}

  @Process(IngestCallEventJob.name)
  async handle(data: IngestCallEventJobData): Promise<void> {
    const { workspaceId, event: serialized } = data;
    const event = deserializeCallEvent(serialized);

    // A manager dialling out is a touch on a contact, not a new lead, so it
    // takes a completely separate path: an outboundActivity, no dedup, no
    // routing, no deal creation.
    if (event.direction === 'out') {
      await this.handleOutbound(workspaceId, event);

      return;
    }

    const ingested = await this.callIngestService.ingest(workspaceId, event);

    if (!isDefined(ingested)) {
      this.logger.warn(
        `Telephony ingest produced no activity for ${event.externalId}`,
      );

      return;
    }

    await this.enqueueRecordingArchive(workspaceId, event, {
      objectNameSingular: 'inboundActivity',
      activityId: ingested.activityId,
    });

    // Resolve the caller only when the row still lacks identity — but never
    // return early on that. One call arrives as several pushes: an earlier
    // non-terminal event fills person+project, and the later terminal one is the
    // only push that can decide the deal's stage. Short-circuiting here meant no
    // call ever produced a deal.
    const personId =
      ingested.needsIdentity && isDefined(ingested.callerE164)
        ? await this.callIdentityService.resolvePersonId(
            workspaceId,
            ingested.callerE164,
          )
        : undefined;

    // A group that exists only to catch calls the responsible manager did not
    // answer is not a number's department, and must not be read as one. The
    // group on a push is the strongest project signal we have AND the source
    // the dial plan is learned from, so left unfiltered the first fall-through
    // would re-point the number at the fallback and every later call on it
    // would resolve to no project. The activity still records where the call
    // actually ended; only routing and learning ignore it.
    const routableGroup = isPbxTransferFallbackGroup(event.answeredByGroup)
      ? undefined
      : event.answeredByGroup;

    // Teach the dial plan from this push. `event` carries both the dialled
    // number and the department, which is the only place the two appear
    // together — a `contact` push has the number but no department.
    await this.pbxNumberService.learn(
      workspaceId,
      event.calleeDid,
      routableGroup,
    );

    const resolved = await this.callIdentityService.resolveEntryPoint(
      workspaceId,
      {
        roistatProjectCode: event.attribution?.projectCode,
        roistatScenario: event.roistatScenario,
        pbxGroupName: routableGroup,
        calleeDid: event.calleeDid,
      },
    );

    // Attribute the call BEFORE deciding whether it is a lead. A non-lead entry
    // point is still a real call that belongs to a real project, and the person
    // and project are what put it on the contact's timeline and into per-project
    // reporting. Returning before this wrote neither, so a department marked
    // `lead: false` produced calls indistinguishable from ones nothing
    // recognised at all — and a project worked outside the CRM could not be
    // observed in it at all.
    const shouldResolveOpportunity = await this.callIngestService.linkIdentity(
      workspaceId,
      ingested.activityId,
      { personId, projectId: resolved?.projectId },
    );

    // Record what the call says about the PERSON as soon as it is over, and
    // before any question of a deal: first touch, the touch on their timeline,
    // consent. Every gate below this line is about whether a DEAL should exist,
    // and none of them changes whether the conversation happened. Enqueued on
    // the terminal push only — a ringing call has not established anything yet
    // — and keyed by activity id, because one call arrives as several pushes
    // and the timeline insert has no dedup of its own.
    if (event.isTerminal) {
      await this.leadPipelineQueueService.add<RecordActivityAttributionJobData>(
        RecordActivityAttributionJob.name,
        { workspaceId, activityId: ingested.activityId },
        { id: `enso-activity-attribution:${ingested.activityId}` },
      );
    }

    // Two entry points can share a project but belong to different teams —
    // TRIUMF Support and TRIUMF Sales are both ENS2101. A support call is a real
    // call worth logging, but it is not a sales lead, so it stops here rather
    // than entering dedup and routing.
    if (resolved?.entryPoint.lead === false) {
      this.logger.log(
        `Activity ${ingested.activityId} is not lead-generating (queue=${resolved.entryPoint.queue ?? 'default'})`,
      );

      return;
    }

    if (!shouldResolveOpportunity) {
      // A call with no resolvable project still lands as a visible activity; it
      // just cannot become a deal, because the pipeline keys dedup and routing
      // on (person, project). Most untracked-DID calls end up here until the
      // PBX-department / DID project map is filled in.
      //
      // `resolveEntryPoint` returning undefined means NOTHING recognised the
      // call — neither the department, nor the learned dial plan, nor the DID
      // map — which is a hole in the configuration, not a decision. That is a
      // lead being dropped on the floor, so it must not read like the routine
      // "recognised, deliberately not a lead" case: warn, and name the two keys
      // an operator would add. Found the hard way — 13 answered calls on an
      // unmapped Newton House department sat unnoticed for two weeks because
      // this line was indistinguishable from the intentional exclusions.
      if (!isDefined(resolved)) {
        this.logger.warn(
          `Unmapped call entry point — activity ${ingested.activityId} on DID ${event.calleeDid ?? 'unknown'} (department ${routableGroup ?? 'unknown'}) resolved no project and cannot become a deal`,
        );

        return;
      }

      this.logger.log(
        `Activity ${ingested.activityId} not ready for opportunity resolution (person=${isDefined(personId)}, project=${isDefined(resolved.projectId)})`,
      );

      return;
    }

    // Wait for the call to be over before deciding anything about the deal.
    if (!event.isTerminal) {
      return;
    }

    // The stage decision does NOT happen here, and must not: `event CANCELLED`
    // is a per-leg push, so on a call a department answered the terminal pushes
    // disagree with each other and whichever arrived first would decide. That
    // opened an answered group call in ROUTING, unowned. DecideCallOutcomeJob
    // runs after a short settle delay and reads the activity instead.
    await this.telephonyQueueService.add<DecideCallOutcomeJobData>(
      DecideCallOutcomeJob.name,
      { workspaceId, activityId: ingested.activityId },
      {
        id: `enso-telephony-decide:${ingested.activityId}`,
        delay: CALL_OUTCOME_SETTLE_MS,
      },
    );
  }

  // Outbound: log the touch and stop. Whatever placed the call — the CRM's own
  // button, the Moldcell app, a desk phone — the PBX reports it the same way, so
  // this one path captures all of them.
  private async handleOutbound(
    workspaceId: string,
    event: NormalizedCallEvent,
  ): Promise<void> {
    // The contact is looked up, never created: we called a number, which says
    // nothing about whether that number belongs in the CRM. An unknown number
    // still logs the call, just without a person link.
    const person = isDefined(event.callerE164)
      ? await this.callIdentityService.lookupPersonByPhone(
          workspaceId,
          event.callerE164,
        )
      : undefined;

    // No fallback owner here, unlike the inbound leg: filing one manager's call
    // under another's name because a PBX login is unmapped would be a plainly
    // wrong record, and an unattributed call is still a true one.
    const performedById =
      await this.callIdentityService.resolveMemberIdByPbxLogin(
        workspaceId,
        event.answeredByLogin,
      );

    const ingested = await this.outboundCallIngestService.ingest(
      workspaceId,
      event,
      {
        ...(isDefined(person) ? { personId: person.id } : {}),
        ...(isDefined(performedById) ? { performedById } : {}),
      },
    );

    if (!isDefined(ingested)) {
      this.logger.warn(
        `Outbound ingest produced no activity for ${event.externalId}`,
      );

      return;
    }

    await this.enqueueRecordingArchive(workspaceId, event, {
      objectNameSingular: 'outboundActivity',
      activityId: ingested.activityId,
    });

    // Only the push that actually knows how the call went finalizes it. Note
    // this is NOT "the first push to record an outcome": an `event CANCELLED`
    // can land first and set NO_ANSWER, and gating on that made the real
    // outcome push look redundant — silently costing the call its deal link and
    // timeline line. Duplicate timeline rows are prevented inside finalize.
    if (!ingested.isAuthoritative) {
      return;
    }

    const opportunityId = isDefined(person)
      ? await this.callIdentityService.resolveSingleOpenOpportunityId(
          workspaceId,
          person.id,
        )
      : undefined;

    const answered =
      isDefined(event.callStatus) &&
      ANSWERED_CALL_STATUSES.includes(event.callStatus);

    await this.outboundCallIngestService.finalize(
      workspaceId,
      ingested.activityId,
      {
        ...(isDefined(opportunityId) ? { opportunityId } : {}),
        ...(isDefined(person) ? { personId: person.id } : {}),
        ...(isDefined(performedById) ? { performedById } : {}),
        ...(isDefined(event.durationS) ? { durationS: event.durationS } : {}),
        answered,
      },
    );

    // A manager who rang a claimed lead and was answered has made first
    // contact, so the deal advances itself and the callback task that asked for
    // the call closes. This is what CONNECTED is supposed to mean — and it is
    // why a call nobody picked up must NOT be recorded as connected.
    if (answered && isDefined(opportunityId)) {
      await this.callFollowUpService.connectFromAnsweredOutboundCall(
        workspaceId,
        opportunityId,
        ingested.activityId,
      );
    }
  }

  private async enqueueRecordingArchive(
    workspaceId: string,
    event: NormalizedCallEvent,
    target: {
      objectNameSingular: 'inboundActivity' | 'outboundActivity';
      activityId: string;
    },
  ): Promise<void> {
    if (!ARCHIVE_RECORDINGS || !isDefined(event.recordingUrl)) {
      return;
    }

    // PBX recordings only. Roistat's after-call slot carries a link to the SAME
    // audio in Roistat's own storage, and every Roistat-tracked call is also a
    // PBX call — so archiving both would race two jobs onto one activity and
    // spend retries on a store we have no credentials for.
    if (event.provider !== 'moldcell') {
      return;
    }

    await this.telephonyQueueService.add<ArchiveCallRecordingJobData>(
      ArchiveCallRecordingJob.name,
      {
        workspaceId,
        recordingUrl: event.recordingUrl,
        ...target,
        ...(isDefined(event.occurredAt)
          ? { occurredAtIso: event.occurredAt.toISOString() }
          : {}),
        attempt: 1,
      },
      {
        id: `enso-telephony-recording:${target.activityId}:1`,
        // The PBX finishes writing the audio after the call ends, so asking for
        // it the instant `history` lands is a guaranteed miss on short calls.
        delay: RECORDING_INITIAL_DELAY_MS,
      },
    );
  }
}
