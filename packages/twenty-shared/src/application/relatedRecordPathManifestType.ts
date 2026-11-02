import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type RelatedRecordPathManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  firstFieldMetadataUniversalIdentifier: string;
  secondFieldMetadataUniversalIdentifier?: string;
  thirdFieldMetadataUniversalIdentifier?: string;
  isInherent?: boolean;
};
