import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageListWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export class MessageListMemberWorkspaceEntity extends BaseWorkspaceEntity {
  list: EntityRelation<MessageListWorkspaceEntity>;
  listId: string;
  person: EntityRelation<PersonWorkspaceEntity>;
  personId: string;
  searchVector: string;
}
