import { type RelationType } from '@/types/RelationType';

export type RelationCreationPayload = {
  type: RelationType;
  targetObjectMetadataId: string;
  targetFieldLabel: string;
  targetFieldName?: string;
  targetFieldIcon: string;
};
