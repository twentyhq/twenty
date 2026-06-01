import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const EMAIL_ADDRESS_FIELD_NAME = 'emailAddress';

export const SEARCH_FIELDS_FOR_EMAIL_GROUP_SUPPRESSION_LIST: FieldTypeAndNameMetadata[] =
  [{ name: EMAIL_ADDRESS_FIELD_NAME, type: FieldMetadataType.TEXT }];

export class EmailGroupSuppressionListWorkspaceEntity extends BaseWorkspaceEntity {
  emailAddress: string;
  reason: string;
  source: string;
  providerEventId: string | null;
  searchVector: string;
}
