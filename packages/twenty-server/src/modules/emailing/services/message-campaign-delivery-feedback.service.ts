import { Injectable } from '@nestjs/common';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessageCampaignLifecycleService } from 'src/modules/emailing/services/message-campaign-lifecycle.service';
import { isDefined } from 'twenty-shared/utils';

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
    outcome: 'DELIVERED' | 'BOUNCED' | 'COMPLAINED';
  }): Promise<void> {
    const delivery = await this.campaignDeliveryRepository.findOneBy(
      workspaceId,
      { providerMessageId },
    );

    if (!isDefined(delivery)) {
      return;
    }

    // Each outcome owns its own column, so a report that arrives late or twice
    // writes the same value again instead of erasing a different outcome.
    await this.campaignDeliveryRepository.update(
      workspaceId,
      { id: delivery.id },
      this.buildOutcomeStamp(outcome),
    );

    await this.messageCampaignLifecycleService.scheduleStatsRefresh({
      workspaceId,
      campaignId: delivery.campaignId,
    });
  }

  private buildOutcomeStamp(
    outcome: 'DELIVERED' | 'BOUNCED' | 'COMPLAINED',
  ): Partial<
    Pick<CampaignDeliveryEntity, 'deliveredAt' | 'bouncedAt' | 'complainedAt'>
  > {
    const occurredAt = new Date();

    switch (outcome) {
      case 'DELIVERED':
        return { deliveredAt: occurredAt };
      case 'BOUNCED':
        return { bouncedAt: occurredAt };
      case 'COMPLAINED':
        return { complainedAt: occurredAt };
    }
  }
}
