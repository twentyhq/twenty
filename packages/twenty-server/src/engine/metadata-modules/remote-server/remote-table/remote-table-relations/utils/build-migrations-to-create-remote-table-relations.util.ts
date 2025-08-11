import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  type WorkspaceMigrationColumnCreate,
  type WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const buildMigrationsToCreateRemoteTableRelations = (
  createdObjectNameSingular: string,
  targetObjectMetadataList: ObjectMetadataEntity[],
  primaryKeyColumnType: string,
): WorkspaceMigrationTableAction[] =>
  targetObjectMetadataList.map((targetObjectMetadata) => ({
    name: computeObjectTargetTable(targetObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(createdObjectNameSingular, {
          isForeignKey: true,
        }),
        columnType: primaryKeyColumnType,
        isNullable: true,
        defaultValue: null,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  }));
