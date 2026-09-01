import { Injectable } from '@nestjs/common';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { CAMPAIGN_PROVIDER_OUTCOME } from 'src/engine/core-modules/emailing-domain/constants/campaign-provider-outcome.constant';
import { type CampaignProviderOutcome } from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

type CampaignDeliveryOutcomeUpdate = Partial<
  Pick<
    CampaignDeliveryEntity,
    'deliveredAt' | 'bouncedAt' | 'complainedAt' | 'state' | 'failureReason'
  >
>;

@Injectable()
export class MessageCampaignDeliveryFeedbackService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly messageCampaignLifecycleService: MessageCampaignLifecycleService,
  ) {}

  async recordProviderOutcomeByProviderMessageId({
    workspaceId,
    providerMessageId,
    outcome,
  }: {
    workspaceId: string;
    providerMessageId: string;
    outcome: CampaignProviderOutcome;
  }): Promise<void> {
    const update = this.buildOutcomeUpdate(outcome);

    if (Object.keys(update).length === 0) {
      return;
    }

    // Matched and stamped in one statement rather than a lookup followed by an
    // update: providerMessageId is unique per workspace, so this settles the
    // same single row, halves the queries a webhook costs, and closes the
    // window where the row could change between the two.
    const { raw } = await this.campaignDeliveryRepository
      .createQueryBuilder()
      .update()
      .set(update as QueryDeepPartialEntity<CampaignDeliveryEntity>)
      .where('"workspaceId" = :workspaceId', { workspaceId })
      .andWhere('"providerMessageId" = :providerMessageId', {
        providerMessageId,
      })
      .returning(['campaignId'])
      .execute();

    const [updatedDelivery] = raw as { campaignId: string }[];

    if (!isDefined(updatedDelivery)) {
      return;
    }

    await this.messageCampaignLifecycleService.scheduleStatsRefresh({
      workspaceId,
      campaignId: updatedDelivery.campaignId,
    });
  }

  private buildOutcomeUpdate(
    outcome: CampaignProviderOutcome,
  ): CampaignDeliveryOutcomeUpdate {
    const occurredAt = new Date();

    switch (outcome) {
      case CAMPAIGN_PROVIDER_OUTCOME.DELIVERED:
        return { deliveredAt: occurredAt };
      case CAMPAIGN_PROVIDER_OUTCOME.BOUNCED:
        return { bouncedAt: occurredAt };
      case CAMPAIGN_PROVIDER_OUTCOME.COMPLAINED:
        return { complainedAt: occurredAt };
      case CAMPAIGN_PROVIDER_OUTCOME.REJECTED:
        return {
          state: CAMPAIGN_DELIVERY_STATE.FAILED,
          failureReason: CAMPAIGN_FAILURE_REASON.REJECTED,
        };
      case CAMPAIGN_PROVIDER_OUTCOME.RENDERING_FAILED:
        return {
          state: CAMPAIGN_DELIVERY_STATE.FAILED,
          failureReason: CAMPAIGN_FAILURE_REASON.RENDERING_FAILED,
        };
      case CAMPAIGN_PROVIDER_OUTCOME.SOFT_BOUNCED:
        return {};
      default:
        return assertUnreachable(outcome);
    }
  }
}
