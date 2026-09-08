import { Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { ClaimCheckJob } from 'src/modules/enso/lead-pipeline/jobs/claim-check.job';
import {
  type ClaimCheckJobData,
  type NotifyManagerAssignmentJobData,
  type RouteOpportunityJobData,
} from 'src/modules/enso/lead-pipeline/jobs/lead-pipeline-job.types';
import { NotifyManagerAssignmentJob } from 'src/modules/enso/lead-pipeline/jobs/notify-manager-assignment.job';
import { CLAIM_WINDOW_MS } from 'src/modules/enso/lead-pipeline/lead-pipeline.constants';
import { ManagerNotificationService } from 'src/modules/enso/lead-pipeline/services/manager-notification.service';
import { OpportunityRoutingService } from 'src/modules/enso/lead-pipeline/services/opportunity-routing.service';
import { CallFollowUpService } from 'src/modules/enso/telephony/services/call-follow-up.service';

// Stage 2: assign a manager to an opportunity in ROUTING.
//   - sticky owner → auto-claimed (LEAD_CLAIMED): notify, no claim window.
//   - round-robin assignment → notify + open a 3-min claim window (claim-check).
//   - parked (no available manager for the project) → keep a heartbeat
//     (claim-check) so the deal resumes within one window of someone coming
//     online. Routing never hard-stops.
@Processor(MessageQueue.ensoLeadPipelineQueue)
export class RouteOpportunityJob {
  private readonly logger = new Logger(RouteOpportunityJob.name);

  constructor(
    private readonly opportunityRoutingService: OpportunityRoutingService,
    private readonly callFollowUpService: CallFollowUpService,
    @InjectMessageQueue(MessageQueue.ensoLeadPipelineQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(RouteOpportunityJob.name)
  async handle(data: RouteOpportunityJobData): Promise<void> {
    const { workspaceId, opportunityId, excludedManagerIds, attempt } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    const result = await this.opportunityRoutingService.routeOpportunity(
      authContext,
      opportunityId,
      excludedManagerIds,
      attempt,
    );

    if (result.status === 'already_claimed' || result.status === 'not_found') {
      return;
    }

    if (result.status === 'no_candidates') {
      // Parked: nobody online + assigned to this project's routing. Keep a
      // heartbeat so the deal is picked up when a manager comes online.
      this.logger.warn(
        `Opportunity ${opportunityId} parked — no available manager for its project (attempt ${attempt}).`,
      );
      await this.scheduleClaimCheck(
        workspaceId,
        opportunityId,
        attempt,
        excludedManagerIds,
      );

      return;
    }

    // Assigned — notify the manager (separate job).
    await this.messageQueueService.add<NotifyManagerAssignmentJobData>(
      NotifyManagerAssignmentJob.name,
      {
        workspaceId,
        opportunityId,
        managerId: result.managerId,
        autoClaimed: result.autoClaimed,
      },
    );

    // Sticky auto-claim already moved the deal to LEAD_CLAIMED — no claim window.
    if (result.autoClaimed) {
      // The deal just acquired the owner who was already responsible for this
      // client. If what opened it was a call they did not pick up, that is an
      // obligation on them personally, so it becomes their task rather than
      // going back to the queue.
      await this.callFollowUpService.createMissedCallCallbackTask(
        workspaceId,
        opportunityId,
      );

      return;
    }

    // Round-robin assignment → open the claim window; reroute excludes the
    // just-assigned manager so the next attempt rotates.
    await this.scheduleClaimCheck(workspaceId, opportunityId, attempt, [
      ...excludedManagerIds,
      result.managerId,
    ]);
  }

  private async scheduleClaimCheck(
    workspaceId: string,
    opportunityId: string,
    attempt: number,
    excludedManagerIds: string[],
  ): Promise<void> {
    await this.messageQueueService.add<ClaimCheckJobData>(
      ClaimCheckJob.name,
      { workspaceId, opportunityId, attempt, excludedManagerIds },
      {
        delay: CLAIM_WINDOW_MS,
        // Idempotent: one claim-check per (opportunity, attempt).
        id: `enso-claim-check:${opportunityId}:${attempt}`,
      },
    );
  }
}
