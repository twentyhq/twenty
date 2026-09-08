import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type ResolveOpportunityFromActivityJobData } from 'src/modules/enso/lead-pipeline/jobs/lead-pipeline-job.types';
import { ResolveOpportunityFromActivityJob } from 'src/modules/enso/lead-pipeline/jobs/resolve-opportunity-from-activity.job';
import { type DecideCallOutcomeJobData } from 'src/modules/enso/telephony/jobs/telephony-job.types';
import { CallIdentityService } from 'src/modules/enso/telephony/services/call-identity.service';
import { CallIngestService } from 'src/modules/enso/telephony/services/call-ingest.service';
import { ANSWERED_CALL_STATUSES } from 'src/modules/enso/telephony/telephony.constants';

// Decides whether an inbound call was answered, and hands it to the lead
// pipeline. Runs a short delay after the call ends, and reads the ACTIVITY —
// never the single push that happened to arrive last.
//
// Why this job exists at all. `event CANCELLED` is a PER-LEG event: when a call
// rings a department, every extension that did not win the race gets its own
// CANCELLED push. Deciding the stage from whichever terminal push arrived first
// therefore turned an answered group call into an abandoned one — observed live,
// Alexandr answered on ext 722 while Denis's ext 704 was cancelled, and the deal
// opened in ROUTING with no owner. The pushes race each other over HTTP, so this
// was a coin flip on every call a department picked up, and it only looked
// correct in earlier tests because one person was the whole department.
//
// Waiting lets every push for the call land first, after which the row's own
// state is unambiguous: `history` has authority over the status, and
// `salesPickup` records that an individual accepted.
@Processor(MessageQueue.ensoTelephonyQueue)
export class DecideCallOutcomeJob {
  private readonly logger = new Logger(DecideCallOutcomeJob.name);

  constructor(
    private readonly callIngestService: CallIngestService,
    private readonly callIdentityService: CallIdentityService,
    @InjectMessageQueue(MessageQueue.ensoLeadPipelineQueue)
    private readonly leadPipelineQueueService: MessageQueueService,
  ) {}

  @Process(DecideCallOutcomeJob.name)
  async handle(data: DecideCallOutcomeJobData): Promise<void> {
    const { workspaceId, activityId } = data;

    const settled = await this.callIngestService.readSettledOutcome(
      workspaceId,
      activityId,
    );

    if (!isDefined(settled)) {
      this.logger.warn(`Activity ${activityId} vanished before its decision`);

      return;
    }

    // Already has a deal — a redelivered push, or the other terminal push of the
    // same call got here first. Nothing to decide.
    if (settled.hasOpportunity) {
      return;
    }

    if (!isDefined(settled.callStatus) && !settled.salesPickup) {
      // Terminal but no outcome ever landed. Left deliberately visible: it is
      // the signal that a call could silently fail to become a lead, and the
      // reconciliation sweep is the fix if it ever shows up in practice.
      this.logger.warn(
        `Activity ${activityId} ended with no call outcome — not creating a deal`,
      );

      return;
    }

    // An individual accepting the call is proof of a two-way conversation even
    // if the status says otherwise, which is exactly the losing-leg case.
    const answered =
      settled.salesPickup ||
      (isDefined(settled.callStatus) &&
        ANSWERED_CALL_STATUSES.includes(settled.callStatus));

    const alreadyConnected = answered
      ? {
          ownerMemberId:
            await this.callIdentityService.resolveAnsweredOwnerMemberId(
              workspaceId,
              settled.answeredByLogin,
            ),
        }
      : undefined;

    // An answered call whose PBX login is nobody in this CRM still has a known
    // answerer. Name them on the activity rather than handing the deal to a
    // stand-in owner: a project whose team works in another system has no
    // member who could truthfully own it, and a wrong owner reads as a real
    // assignment to everyone who sees it.
    if (
      answered &&
      !isDefined(alreadyConnected?.ownerMemberId) &&
      isDefined(settled.answeredByLogin)
    ) {
      await this.callIngestService.recordAnswererLogin(
        workspaceId,
        activityId,
        settled.answeredByLogin,
      );
    }

    await this.leadPipelineQueueService.add<ResolveOpportunityFromActivityJobData>(
      ResolveOpportunityFromActivityJob.name,
      {
        workspaceId,
        activityId,
        ...(isDefined(alreadyConnected) ? { alreadyConnected } : {}),
      },
      { id: `enso-telephony-resolve:${activityId}` },
    );

    this.logger.log(
      `Activity ${activityId} settled as ${settled.callStatus ?? 'no status'}` +
        `${settled.salesPickup ? ' (individual pickup)' : ''} → ${
          answered ? 'CONNECTED' : 'ROUTING'
        }`,
    );
  }
}
