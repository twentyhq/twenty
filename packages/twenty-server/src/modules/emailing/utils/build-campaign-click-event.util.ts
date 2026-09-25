import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type CampaignEngagementEventService } from 'src/modules/emailing/services/campaign-engagement-event.service';
import { type CampaignDeliveryWorkspaceEntity } from 'src/modules/emailing/standard-objects/campaign-delivery.workspace-entity';
import { type CampaignEngagementObservation } from 'src/modules/emailing/types/campaign-engagement-observation.type';
import { classifyEngagementUserAgent } from 'src/modules/emailing/utils/classify-engagement-user-agent.util';

export const buildCampaignClickEvent = ({
  delivery,
  workspace,
  observation,
}: {
  delivery: Pick<CampaignDeliveryWorkspaceEntity, 'id' | 'campaignId'>;
  workspace: Pick<WorkspaceEntity, 'isCampaignClickTrackingEnabled'> | null;
  observation: CampaignEngagementObservation;
}):
  | Parameters<CampaignEngagementEventService['insertClickOrThrow']>[0]
  | null => {
  if (!workspace?.isCampaignClickTrackingEnabled) {
    return null;
  }

  return {
    workspaceId: observation.workspaceId,
    messageCampaignId: delivery.campaignId,
    shortLinkId: observation.shortLinkId,
    deliveryId: delivery.id,
    eventId: observation.eventId,
    occurredAt: observation.occurredAt,
    activityClass: classifyEngagementUserAgent(observation.userAgent),
  };
};
