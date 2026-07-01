import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';

export class UnsubscribeTopicWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  description: string | null;
  visibility: string;
  campaigns: EntityRelation<MessageCampaignWorkspaceEntity[]>;
  searchVector: string;
}
