import { type CampaignDeliveryEntity } from 'src/engine/core-modules/emailing-domain/campaign-delivery.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';
import { classifyEngagementUserAgent } from 'src/modules/emailing/utils/classify-engagement-user-agent.util';

export const buildCampaignClickEvent = ({
  delivery,
  workspace,
  observation,
}: {
  delivery: Pick<CampaignDeliveryEntity, 'id' | 'workspaceId' | 'campaignId'>;
  workspace: Pick<WorkspaceEntity, 'isCampaignClickTrackingEnabled'> | null;
  observation: CampaignEngagementObservation;
}):
  | Parameters<CampaignEngagementEventService['insertClickOrThrow']>[0]
  | null => {
  if (!workspace?.isCampaignClickTrackingEnabled) {
    return null;
  }

  return {
    workspaceId: delivery.workspaceId,
    messageCampaignId: delivery.campaignId,
    shortLinkId: observation.shortLinkId,
    deliveryId: delivery.id,
    eventId: observation.eventId,
    occurredAt: observation.occurredAt,
    activityClass: classifyEngagementUserAgent(observation.userAgent),
  };
};
