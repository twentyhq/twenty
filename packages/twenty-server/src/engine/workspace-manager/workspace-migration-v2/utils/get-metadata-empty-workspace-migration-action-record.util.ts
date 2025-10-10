import { MetadataWorkspaceMigrationActionsRecord } from "src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type";
import { AllMetadataName } from "src/engine/metadata-modules/flat-entity/types/all-metadata-name.type";

export const getMetadataEmptyWorkspaceMigrationActionRecord = <
  T extends AllMetadataName,
>(
  _metadataName: T,
) =>
  ({
    created: [],
    deleted: [],
    updated: [],
  }) as MetadataWorkspaceMigrationActionsRecord<T>;
