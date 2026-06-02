import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageTopicWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-topic.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export class MessageSubscriptionWorkspaceEntity extends BaseWorkspaceEntity {
  status: string;
  subscribedAt: Date | null;
  unsubscribedAt: Date | null;
  source: string;
  list: EntityRelation<MessageTopicWorkspaceEntity>;
  listId: string;
  person: EntityRelation<PersonWorkspaceEntity>;
  personId: string;
  searchVector: string;
}
