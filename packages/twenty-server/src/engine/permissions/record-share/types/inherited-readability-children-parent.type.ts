/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type InheritedReadabilityChildrenParent = {
  kind: 'children';
  fieldMetadataId: string;
  childJoinColumnName: string;
  childFlatObjectMetadata: FlatObjectMetadata;
};
