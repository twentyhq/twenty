import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_CAMPAIGN: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class CampaignWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  status: string;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  targetAudience: string | null;
  totalRecipients: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  conversionCount: number;
  owner: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  ownerId: string | null;
  searchVector: string;
}
