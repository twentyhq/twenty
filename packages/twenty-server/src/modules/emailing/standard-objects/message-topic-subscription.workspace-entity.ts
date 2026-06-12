import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageTopicWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-topic.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export class MessageTopicSubscriptionWorkspaceEntity extends BaseWorkspaceEntity {
  status: string;
  topic: EntityRelation<MessageTopicWorkspaceEntity>;
  topicId: string;
  person: EntityRelation<PersonWorkspaceEntity>;
  personId: string;
  searchVector: string;
}
