import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_SIGNATURE_REQUEST: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export enum SignatureRequestStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  SIGNED = 'SIGNED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum SignatureProvider {
  DOCUSIGN = 'DOCUSIGN',
  HELLOSIGN = 'HELLOSIGN',
  ADOBE_SIGN = 'ADOBE_SIGN',
  INTERNAL = 'INTERNAL',
}

export class SignatureRequestWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  description: string | null;
  status: SignatureRequestStatus;
  provider: SignatureProvider;
  providerRequestId: string | null;
  providerEnvelopeId: string | null;
  documentId: string | null;
  documentUrl: string | null;
  signedDocumentUrl: string | null;
  signedDocumentId: string | null;
  message: string | null;
  expirationDate: Date | null;
  reminderEnabled: boolean;
  reminderInterval: number | null; // in hours
  maxReminders: number | null;
  requireInPerson: boolean;
  enableSigningOrder: boolean;
  redirectUrl: string | null;
  createdBy: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  createdById: string | null;
  searchVector: string;
}

export class SignatureSignerWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  email: string;
  role: string | null;
  order: number;
  status: string;
  signedAt: Date | null;
  declinedReason: string | null;
  ipAddress: string | null;
  providerSignerId: string | null;
  signatureUrl: string | null;
  signatureImage: string | null;
  signatureRequest: EntityRelation<SignatureRequestWorkspaceEntity> | null;
  signatureRequestId: string | null;
  searchVector: string;
}

export class SignatureEventWorkspaceEntity extends BaseWorkspaceEntity {
  eventType: string;
  eventTimestamp: Date;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  providerEventId: string | null;
  signatureRequest: EntityRelation<SignatureRequestWorkspaceEntity> | null;
  signatureRequestId: string | null;
  signer: EntityRelation<SignatureSignerWorkspaceEntity> | null;
  signerId: string | null;
  searchVector: string;
}
