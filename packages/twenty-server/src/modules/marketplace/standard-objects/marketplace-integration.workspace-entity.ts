import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_INTEGRATION: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class MarketplaceIntegrationWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  provider: string;
  status: string;
  config: string | null;
  credentials: string | null;
  lastSyncAt: Date | null;
  syncStatus: string | null;
  errorMessage: string | null;
  searchVector: string;
}
