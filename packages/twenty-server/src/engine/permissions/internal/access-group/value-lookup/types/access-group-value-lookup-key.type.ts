/* @license Enterprise */

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type AccessGroupValueLookupKey = {
  memberFieldKey: string | null;
  columnName: string;
  relationHop: {
    targetFlatObjectMetadata: FlatObjectMetadata;
    sourceColumnName: string;
    targetColumnName: string;
  } | null;
};
