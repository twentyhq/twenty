import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_LANDING_PAGE: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum LandingPageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class LandingPageWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  content: string;
  contentHtml: string | null;
  contentJson: string | null;
  style: string | null;
  status: LandingPageStatus;
  publishedAt: Date | null;
  formId: string | null;
  campaignId: string | null;
  visitors: number;
  conversions: number;
  searchVector: string;
}
