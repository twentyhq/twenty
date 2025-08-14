import { FailedAndSuccessfulMetadataBuildRecord } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/failed-and-successful-metadata-build-record.type';

export const EMPTY_FAILED_AND_SUCESSFUL_METADATA_BUILD_RECORD = {
  failed: [],
  successful: [],
} as const satisfies FailedAndSuccessfulMetadataBuildRecord;
