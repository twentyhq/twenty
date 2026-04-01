import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_DOCUMENT: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
}

export class DocumentWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  type: string;
  content: string | null;
  contentHtml: string | null;
  status: DocumentStatus;
  version: number;
  templateId: string | null;
  signedAt: Date | null;
  expiresAt: Date | null;
  signers: string | null;
  searchVector: string;
}
