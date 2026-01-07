import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export class MessageThreadWorkspaceEntity extends BaseWorkspaceEntity {
  messages: Relation<MessageWorkspaceEntity[]>;
}
