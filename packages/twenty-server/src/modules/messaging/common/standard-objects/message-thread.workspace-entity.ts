import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'twenty-shared/types';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_THREAD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageThread,

  namePlural: 'messageThreads',
  labelSingular: msg`Message Thread`,
  labelPlural: msg`Message Threads`,
  description: msg`A group of related messages (e.g. email thread, chat thread)`,
  icon: STANDARD_OBJECT_ICONS.messageThread,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageThreadWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_STANDARD_FIELD_IDS.messages,
    type: RelationType.ONE_TO_MANY,
    label: msg`Messages`,
    description: msg`Messages from the thread.`,
    icon: 'IconMessage',
    inverseSideTarget: () => MessageWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messages: Relation<MessageWorkspaceEntity[]>;
}
