import { MetadataWorkspaceMigrationActionsRecord } from "src/engine/metadata-modules/flat-entity/types/all-flat-entities-by-metadata-engine-name.type";
import { AllMetadataName } from "src/engine/metadata-modules/flat-entity/types/all-metadata-name.type";
import { Arrayable } from "twenty-shared/types";

export const getMetadataEmptyWorkspaceMigrationActionRecord = <
  T extends AllMetadataName,
>(
  _metadataName: T,
) =>
  ({
    created: [],
    deleted: [],
    updated: [],
  }) as Arrayable<MetadataWorkspaceMigrationActionsRecord<T>>;
