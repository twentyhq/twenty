import type { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

import { type ExtractNestedStringValues } from './utils/ExtractValues';

export type AllStandardObjectIds = ExtractNestedStringValues<
  typeof STANDARD_OBJECT_IDS
>;
