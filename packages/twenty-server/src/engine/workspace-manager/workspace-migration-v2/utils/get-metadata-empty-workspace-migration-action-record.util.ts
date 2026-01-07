import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataWorkspaceMigrationActionsRecord } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

export const getMetadataEmptyWorkspaceMigrationActionRecord = <
  T extends AllMetadataName,
>(
  _metadataName: T,
) =>
  ({
    create: [],
    delete: [],
    update: [],
  }) as MetadataWorkspaceMigrationActionsRecord<T>;
