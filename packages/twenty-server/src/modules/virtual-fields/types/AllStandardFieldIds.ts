import type { STANDARD_OBJECT_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { type ExtractNestedStringValues } from 'src/modules/virtual-fields/types/utils/ExtractValues';

export type AllStandardFieldIds = ExtractNestedStringValues<
  typeof STANDARD_OBJECT_FIELD_IDS
>;
