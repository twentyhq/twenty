import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FailedAndSuccessfulMetadataValidateAndBuildRecord } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/failed-and-successful-metadata-validate-and-build-record.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type MetadataActionValidateAndBuildResult<
  T extends WorkspaceMigrationActionV2,
> = {
  results: FailedAndSuccessfulMetadataValidateAndBuildRecord<T>;
  optimisticFlatObjectMetadataMaps: FlatObjectMetadataMaps;
};
