import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { MessageTrackingConsentService } from 'src/modules/emailing/services/message-tracking-consent.service';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';
import { classifyEngagementUserAgent } from 'src/modules/emailing/utils/classify-engagement-user-agent.util';

@Injectable()
export class CampaignEngagementRecordingService {
  constructor(
    // eslint-disable-next-line twenty/prefer-workspace-scoped-repository
    @InjectRepository(CampaignDeliveryEntity)
    private readonly campaignDeliveryRepository: Repository<CampaignDeliveryEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly messageTrackingConsentService: MessageTrackingConsentService,
  ) {}

  async record(observation: CampaignEngagementObservation): Promise<void> {
    const delivery = await this.campaignDeliveryRepository.findOne({
      where: { id: observation.deliveryId },
    });

    if (!isDefined(delivery)) {
      return;
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: delivery.workspaceId,
    });

    if (!workspace?.isCampaignClickTrackingEnabled) {
      return;
    }

    const decision = await this.messageTrackingConsentService.findDecision({
      workspaceId: delivery.workspaceId,
      emailAddress: delivery.recipientEmail,
    });

    if (decision === MessageTrackingConsentDecision.DENIED) {
      return;
    }

    await this.campaignEngagementEventService.insertClickOrThrow({
      workspaceId: delivery.workspaceId,
      messageCampaignId: delivery.campaignId,
      shortLinkId: observation.shortLinkId,
      deliveryId: delivery.id,
      eventId: observation.eventId,
      occurredAt: observation.occurredAt,
      activityClass: classifyEngagementUserAgent(observation.userAgent),
    });
  }
}
