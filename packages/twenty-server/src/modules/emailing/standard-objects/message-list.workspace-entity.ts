import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { type MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';

export class MessageListWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  members: EntityRelation<MessageListMemberWorkspaceEntity[]>;
  campaigns: EntityRelation<MessageCampaignWorkspaceEntity[]>;
  searchVector: string;
}
