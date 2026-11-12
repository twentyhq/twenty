import { type WorkspaceDerivedCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

export type PageLayoutIdentifierMaps = Pick<
  WorkspaceDerivedCacheDataMap,
  'objectIdByName' | 'fieldIdByObjectIdAndName'
>;
