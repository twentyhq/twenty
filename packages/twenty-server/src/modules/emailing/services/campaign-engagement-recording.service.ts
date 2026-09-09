import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { createHash } from 'node:crypto';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { MessageCampaignStatisticsService } from 'src/modules/emailing/services/message-campaign-statistics.service';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';
import { CAMPAIGN_ENGAGEMENT_CLASSIFICATION_VERSION } from 'src/modules/emailing/constants/campaign-engagement-classification-version.constant';
import { classifyEngagementUserAgent } from 'src/modules/emailing/utils/classify-engagement-user-agent.util';

@Injectable()
export class CampaignEngagementRecordingService {
  private readonly logger = new Logger(CampaignEngagementRecordingService.name);

  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: Repository<CampaignDeliveryEntity>,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly messageCampaignStatisticsService: MessageCampaignStatisticsService,
  ) {}

  async record(observation: CampaignEngagementObservation): Promise<void> {
    const delivery = await this.campaignDeliveryRepository.findOne({
      where: { id: observation.deliveryId },
    });

    if (!isDefined(delivery)) {
      return;
    }

    const classification = classifyEngagementUserAgent(observation.userAgent);

    await this.campaignEngagementEventService.insertOrThrow({
      workspaceId: delivery.workspaceId,
      messageCampaignId: delivery.campaignId,
      deliveryId: delivery.id,
      recipientEmailHash: this.hashRecipientEmail(delivery.recipientEmail),
      personId: delivery.personId,
      eventId: observation.eventId,
      occurredAt: observation.occurredAt,
      eventType: observation.eventType,
      destinationId: observation.destinationId,
      messagePart: observation.messagePart,
      activityClass: classification.activityClass,
      classificationVersion: CAMPAIGN_ENGAGEMENT_CLASSIFICATION_VERSION,
      classificationReasons: classification.classificationReasons,
      clientFamily: classification.clientFamily,
    });

    await this.messageCampaignStatisticsService
      .scheduleRefresh({
        workspaceId: delivery.workspaceId,
        campaignId: delivery.campaignId,
      })
      .catch((error) => {
        this.logger.warn(
          `Recorded ${observation.eventType} for delivery ${delivery.id} but could not schedule a statistics refresh: ${error}`,
        );
      });
  }

  private hashRecipientEmail(recipientEmail: string): string {
    return createHash('sha256')
      .update(recipientEmail.trim().toLowerCase())
      .digest('hex');
  }
}
