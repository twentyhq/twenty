import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type EmailListWorkspaceEntity } from 'src/modules/emailing/standard-objects/email-list.workspace-entity';

const NAME_FIELD_NAME = 'name';
const SUBJECT_FIELD_NAME = 'subject';

export const SEARCH_FIELDS_FOR_EMAIL_CAMPAIGN: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: SUBJECT_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class EmailCampaignWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  subject: string | null;
  bodyTemplate: string | null;
  fromAddress: string | null;
  replyTo: string | null;
  status: string;
  recipientSource: string;
  scheduledAt: Date | null;
  sentAt: Date | null;
  sentCount: number;
  bouncedCount: number;
  failedCount: number;
  list: EntityRelation<EmailListWorkspaceEntity> | null;
  listId: string | null;
  searchVector: string;
}
