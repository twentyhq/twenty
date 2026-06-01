import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type EmailCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/email-campaign.workspace-entity';
import { type EmailListSubscriptionWorkspaceEntity } from 'src/modules/emailing/standard-objects/email-list-subscription.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_EMAIL_LIST: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class EmailListWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  subscriptions: EntityRelation<EmailListSubscriptionWorkspaceEntity[]>;
  campaigns: EntityRelation<EmailCampaignWorkspaceEntity[]>;
  searchVector: string;
}
