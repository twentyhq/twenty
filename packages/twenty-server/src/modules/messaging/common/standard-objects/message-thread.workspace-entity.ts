import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration-v2/types/entity-relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export class MessageThreadWorkspaceEntity extends BaseWorkspaceEntity {
  messages: EntityRelation<MessageWorkspaceEntity[]>;
}
