import { EMPTY_FAILED_AND_SUCESSFUL_METADATA_BUILD_RECORD } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/constants/empty-failed-and-successful-metadata-build-record.constant';
import { FailedAndSuccessfulMetadataValidateAndBuildRecord } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/failed-and-successful-metadata-validate-and-build-record.type';
import { MetadataValidateAndBuildResult } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/metadata-validate-and-build-result.type';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export const fromMetadataBuildResultsToFailedAndSuccessfulMetadataBuildRecord =
  <T extends WorkspaceMigrationActionV2>(
    metadataBuildResults: MetadataValidateAndBuildResult<T>[],
  ): FailedAndSuccessfulMetadataValidateAndBuildRecord<T> =>
    metadataBuildResults.reduce(
      (acc, buildResult) =>
        buildResult.status === 'failed'
          ? {
              ...acc,
              failed: [...acc.failed, buildResult],
            }
          : { ...acc, successful: [...acc.successful, buildResult] },
      EMPTY_FAILED_AND_SUCESSFUL_METADATA_BUILD_RECORD,
    );
