import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { CampaignDeliveryWorkspaceEntity } from 'src/modules/emailing/standard-objects/campaign-delivery.workspace-entity';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';
import { buildCampaignClickEvent } from 'src/modules/emailing/utils/build-campaign-click-event.util';
import { classifyCampaignOpen } from 'src/modules/emailing/utils/classify-campaign-open.util';

@Injectable()
export class CampaignEngagementRecordingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly campaignEngagementEventService: CampaignEngagementEventService,
    private readonly messageSuppressionService: MessageSuppressionService,
  ) {}

  async record(observation: CampaignEngagementObservation): Promise<void> {
    const delivery = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository(CampaignDeliveryWorkspaceEntity, {
            shouldBypassPermissionChecks: true,
          })
          .findOneBy({ id: observation.deliveryId }),
      buildSystemAuthContext(observation.workspaceId),
    );

    if (!isDefined(delivery)) {
      return;
    }

    const isTrackingOptedOut =
      await this.messageSuppressionService.isTrackingOptedOut({
        workspaceId: observation.workspaceId,
        emailAddress: delivery.recipientEmail,
      });

    if (isTrackingOptedOut) {
      return;
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: observation.workspaceId,
    });

    switch (observation.type) {
      case 'CLICK': {
        const clickEvent = buildCampaignClickEvent({
          delivery,
          workspace,
          observation,
        });

        if (!isDefined(clickEvent)) {
          return;
        }

        await this.campaignEngagementEventService.insertClickOrThrow(
          clickEvent,
        );

        return;
      }
      case 'OPEN': {
        if (!workspace?.isCampaignOpenTrackingEnabled) {
          return;
        }

        await this.campaignEngagementEventService.insertOpenOrThrow({
          workspaceId: observation.workspaceId,
          messageCampaignId: delivery.campaignId,
          deliveryId: delivery.id,
          eventId: observation.eventId,
          occurredAt: observation.occurredAt,
          activityClass: classifyCampaignOpen({
            sentAt: delivery.sentAt,
            occurredAt: observation.occurredAt,
            userAgent: observation.userAgent,
          }),
        });

        return;
      }
    }
  }
}
