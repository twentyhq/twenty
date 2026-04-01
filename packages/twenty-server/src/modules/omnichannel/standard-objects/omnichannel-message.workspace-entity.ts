import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_OMNICHANNEL_MESSAGE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class OmnichannelMessageWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  channel: string;
  direction: 'INBOUND' | 'OUTBOUND';
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  status: string;
  messageId: string | null;
  senderName: string | null;
  senderPhone: string | null;
  senderEmail: string | null;
  recipientPhone: string | null;
  receivedAt: Date | null;
  readAt: Date | null;
  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;
  contact: EntityRelation<PersonWorkspaceEntity> | null;
  contactId: string | null;
  searchVector: string;
}
