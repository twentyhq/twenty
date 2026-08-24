import { Injectable } from '@nestjs/common';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-state.type';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/types/campaign-failure-reason.type';
import {
  CAMPAIGN_PROVIDER_OUTCOME,
  type CampaignProviderOutcome,
} from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';
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

    const delivery = await this.campaignDeliveryRepository.findOneBy(
      workspaceId,
      { providerMessageId },
    );

    if (!isDefined(delivery)) {
      return;
    }

    await this.campaignDeliveryRepository.update(
      workspaceId,
      { id: delivery.id },
      update,
    );

    await this.messageCampaignLifecycleService.scheduleStatsRefresh({
      workspaceId,
      campaignId: delivery.campaignId,
    });
  }

  // Each outcome owns its own column, so a report that arrives late or twice
  // rewrites the same value rather than erasing a different outcome.
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
      // The provider never accepted the message, so these are send failures
      // rather than delivery outcomes.
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
      // Transient, the provider keeps retrying, so nothing is decided yet.
      case CAMPAIGN_PROVIDER_OUTCOME.SOFT_BOUNCED:
        return {};
      default:
        return assertUnreachable(outcome);
    }
  }
}
