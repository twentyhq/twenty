import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  type ResolveOpportunityFromActivityJobData,
  type RouteOpportunityJobData,
} from 'src/modules/enso/lead-pipeline/jobs/lead-pipeline-job.types';
import { RouteOpportunityJob } from 'src/modules/enso/lead-pipeline/jobs/route-opportunity.job';
import { OpportunityResolutionService } from 'src/modules/enso/lead-pipeline/services/opportunity-resolution.service';
import { CallFollowUpService } from 'src/modules/enso/telephony/services/call-follow-up.service';

// Stage 1 of the pipeline: an inbound activity was created. Resolve it to an
// opportunity (dedup → attach or create). If a NEW deal was created it needs
// routing, so hand off to the routing job. Attaching to an existing open deal
// is terminal here.
@Processor(MessageQueue.ensoLeadPipelineQueue)
export class ResolveOpportunityFromActivityJob {
  private readonly logger = new Logger(ResolveOpportunityFromActivityJob.name);

  constructor(
    private readonly opportunityResolutionService: OpportunityResolutionService,
    private readonly callFollowUpService: CallFollowUpService,
    @InjectMessageQueue(MessageQueue.ensoLeadPipelineQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(ResolveOpportunityFromActivityJob.name)
  async handle(data: ResolveOpportunityFromActivityJobData): Promise<void> {
    const { workspaceId, activityId } = data;

    const authContext = buildSystemAuthContext(workspaceId);

    // First touch, timeline and consent used to run here. They are attribution:
    // properties of the activity that hold whether or not it becomes a deal, so
    // they now live in RecordActivityAttributionJob, which every inbound
    // activity gets — including the ones that stop short of a deal.
    const result = await this.opportunityResolutionService.resolveFromActivity(
      authContext,
      activityId,
      { alreadyConnected: data.alreadyConnected },
    );

    if (!result) {
      return;
    }

    // Attached to a deal that already exists — so it already has an owner if it
    // is going to have one, and this is the moment to hand a missed call back to
    // them. (A NEW deal has no owner yet; that case is picked up by the routing
    // job the moment a sticky owner auto-claims it.)
    if (!result.created) {
      await this.callFollowUpService.createMissedCallCallbackTask(
        workspaceId,
        result.opportunityId,
        activityId,
      );

      return;
    }

    // Routing exists to find someone to make first contact. An answered call
    // already had it, so the deal is CONNECTED and there is nothing to route.
    if (isDefined(data.alreadyConnected)) {
      this.logger.log(
        `Opportunity ${result.opportunityId} opened CONNECTED from an answered call; skipping routing`,
      );

      return;
    }

    // The opportunity-created timeline row is now emitted inside
    // OpportunityResolutionService.recordCreatedEvent (richer: B2B/B2C + source).

    await this.messageQueueService.add<RouteOpportunityJobData>(
      RouteOpportunityJob.name,
      {
        workspaceId,
        opportunityId: result.opportunityId,
        excludedManagerIds: [],
        attempt: 0,
      },
    );
  }
}
