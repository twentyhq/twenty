import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  MARKETING_EVENT_DEAL_CREATED,
  type MarketingSyncJobData,
} from 'src/modules/enso/marketing-sync/marketing-sync.constants';
import { DittofeedAdminClientService } from 'src/modules/enso/marketing-sync/services/dittofeed-admin-client.service';
import { DittofeedClientService } from 'src/modules/enso/marketing-sync/services/dittofeed-client.service';

// Worker-side executor: takes a prepared identify/track payload (built by the
// listener) and pushes it to Dittofeed. Kept thin so BullMQ retries handle a
// transient Dittofeed/Resend outage; the client throws on HTTP failure. The
// one exception is deal_created, which needs ORM reads (first-deal count +
// project brand) — done here, off the worker's DB connection.
@Processor(MessageQueue.ensoMarketingSyncQueue)
export class MarketingSyncJob {
  private readonly logger = new Logger(MarketingSyncJob.name);

  constructor(
    private readonly dittofeedClientService: DittofeedClientService,
    private readonly dittofeedAdminClientService: DittofeedAdminClientService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  @Process(MarketingSyncJob.name)
  async handle(data: MarketingSyncJobData): Promise<void> {
    if (data.kind === 'identify') {
      await this.dittofeedClientService.identify(data.workspaceId, {
        userId: data.userId,
        traits: data.traits,
        messageId: data.messageId,
      });

      return;
    }

    if (data.kind === 'sync_consent') {
      await this.dittofeedAdminClientService.setSubscriptionAssignments(
        data.workspaceId,
        data.userId,
        data.changes,
      );

      return;
    }

    if (data.kind === 'track_deal_created') {
      const properties = await this.buildDealCreatedProperties(
        data.workspaceId,
        data.opportunityId,
        data.userId,
      );

      await this.dittofeedClientService.track(data.workspaceId, {
        userId: data.userId,
        event: MARKETING_EVENT_DEAL_CREATED,
        properties,
        timestamp: data.timestamp,
        messageId: data.messageId,
      });

      return;
    }

    await this.dittofeedClientService.track(data.workspaceId, {
      userId: data.userId,
      event: data.event,
      properties: data.properties,
      timestamp: data.timestamp,
      messageId: data.messageId,
    });
  }

  // Enrich a deal_created event from the ORM: the deal's project + amount,
  // whether this is the person's first deal, and the project's name + code.
  // projectName/projectCode are what Dittofeed segments key on to scope a
  // journey to one development (e.g. "New Artima Leads" = projectCode ENS2301).
  private async buildDealCreatedProperties(
    workspaceId: string,
    opportunityId: string,
    userId: string,
  ): Promise<Record<string, unknown>> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const opportunityRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'opportunity',
            { shouldBypassPermissionChecks: true },
          );

        const opportunity = await opportunityRepository.findOne({
          where: { id: opportunityId },
        });

        const projectId = opportunity?.projectId ?? null;
        const amount = opportunity?.amount ?? null;

        // The just-created deal is already persisted, so a count of 1 means it's
        // the person's first.
        const totalForPerson = await opportunityRepository.count({
          where: { pointOfContactId: userId },
        });
        const isFirstDealForPerson = totalForPerson <= 1;

        let projectName: string | null = null;
        let projectCode: string | null = null;

        if (isDefined(projectId)) {
          const projectRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'project',
              { shouldBypassPermissionChecks: true },
            );

          const project = await projectRepository.findOne({
            where: { id: projectId },
          });

          projectName = project?.name ?? null;
          projectCode = project?.code ?? null;
        }

        return {
          opportunityId,
          projectId,
          projectName,
          projectCode,
          amount,
          isFirstDealForPerson,
        };
      },
      buildSystemAuthContext(workspaceId),
    );
  }
}
