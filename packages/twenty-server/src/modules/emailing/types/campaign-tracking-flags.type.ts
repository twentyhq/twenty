import { type MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

export type CampaignTrackingFlags = Pick<
  MessageCampaignWorkspaceEntity,
  'isClickTrackingEnabled'
>;
