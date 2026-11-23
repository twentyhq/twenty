import { type ROLLUP_RESULT_FIELD_METADATA_TYPES } from '@/constants/RollupResultFieldMetadataTypes';

export type RollupResultFieldMetadataType =
  (typeof ROLLUP_RESULT_FIELD_METADATA_TYPES)[number];
