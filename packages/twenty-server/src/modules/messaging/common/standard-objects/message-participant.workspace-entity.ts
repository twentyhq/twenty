import { MessageParticipantRole } from 'twenty-shared/types';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class MessageParticipantWorkspaceEntity extends BaseWorkspaceEntity {
  role: MessageParticipantRole;
  handle: string | null;
  displayName: string | null;
  message: Relation<MessageWorkspaceEntity>;
  messageId: string;
  person: Relation<PersonWorkspaceEntity> | null;
  personId: string | null;
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;
  workspaceMemberId: string | null;
}
