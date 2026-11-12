/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type RelatedRecordPathHop = {
  flatObjectMetadata: FlatObjectMetadata;
  sourceColumnName: string;
  targetColumnName: string;
};

export type ResolvedRelatedRecordPath = {
  isInherent: boolean;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  targetObjectMetadataId: string;
  hops: RelatedRecordPathHop[];
};
