/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RelatedRecordPathHop } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

export type RelatedRecordPathFollowingLookup = {
  targetFlatObjectMetadata: FlatObjectMetadata;
  writtenHop: RelatedRecordPathHop;
  followingHops: RelatedRecordPathHop[];
  recordIds: string[];
  recordsBefore: Record<string, unknown>[];
};
