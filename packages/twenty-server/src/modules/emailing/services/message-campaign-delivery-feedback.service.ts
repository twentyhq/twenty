import { Injectable } from '@nestjs/common';

import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { type CampaignProviderOutcome } from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';
import { buildCampaignDeliveryOutcomeUpdate } from 'src/engine/core-modules/emailing-domain/utils/build-campaign-delivery-outcome-update.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { isDefined } from 'twenty-shared/utils';

@Injectable()
export class MessageCampaignDeliveryFeedbackService {
  constructor(
    @InjectWorkspaceScopedRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: WorkspaceScopedRepository<CampaignDeliveryEntity>,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
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
    const update = buildCampaignDeliveryOutcomeUpdate({
      outcome,
      occurredAt: new Date(),
    });

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

    await this.messageCampaignStatisticsService.scheduleRefresh({
      workspaceId,
      campaignId: updatedDelivery.campaignId,
    });
  }
}
