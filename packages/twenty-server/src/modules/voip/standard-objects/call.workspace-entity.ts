import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CALL: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class CallWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  status: string;
  direction: 'INBOUND' | 'OUTBOUND';
  phoneNumber: string;
  duration: number;
  recordingUrl: string | null;
  recordingDuration: number | null;
  transcription: string | null;
  sentiment: string | null;
  sentimentScore: number | null;
  notes: string | null;
  disposition: string | null;
  callerId: string | null;
  startedAt: Date | null;
  answeredAt: Date | null;
  endedAt: Date | null;
  waitTime: number | null;
  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;
  contact: EntityRelation<PersonWorkspaceEntity> | null;
  contactId: string | null;
  searchVector: string;
}
