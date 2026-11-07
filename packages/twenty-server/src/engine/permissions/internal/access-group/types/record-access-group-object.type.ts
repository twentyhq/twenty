/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordAccessGroupConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-condition-metadata-maps.type';

export type RecordAccessGroupObject = {
  flatObjectMetadata: FlatObjectMetadata;
  metadataMaps: RecordAccessGroupConditionMetadataMaps;
};
