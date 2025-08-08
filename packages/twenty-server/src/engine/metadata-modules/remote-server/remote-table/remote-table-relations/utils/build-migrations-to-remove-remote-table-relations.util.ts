import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationColumnDrop,
  type WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

export const buildMigrationsToRemoveRemoteTableRelations = (
  targetColumnName: string,
  targetObjectMetadataList: ObjectMetadataEntity[],
): WorkspaceMigrationTableAction[] =>
  targetObjectMetadataList.map((objectMetadata) => ({
    name: computeTableName(
      objectMetadata.nameSingular,
      objectMetadata.isCustom,
    ),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.DROP,
        columnName: targetColumnName,
      } satisfies WorkspaceMigrationColumnDrop,
    ],
  }));
