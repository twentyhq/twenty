import { type FIELD_METADATA_ROLLUP_OPERATIONS } from '@/constants/FieldMetadataRollupOperations';

export type FieldMetadataRollupOperation =
  (typeof FIELD_METADATA_ROLLUP_OPERATIONS)[number];
