import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_THREAD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageThread,
  namePlural: 'messageThreads',
  labelSingular: 'Message Thread',
  labelPlural: 'Message Threads',
  description: 'Message Thread',
  icon: STANDARD_OBJECT_ICONS.messageThread,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageThreadWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_STANDARD_FIELD_IDS.messages,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Messages',
    description: 'Messages from the thread.',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messages: Relation<MessageWorkspaceEntity[]>;
}
