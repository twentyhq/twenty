import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationTableAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const createWorkspaceMigrationsForRemoteObjectRelations = async (
  createdObjectMetadata: ObjectMetadataEntity,
  activityTargetObjectMetadata: ObjectMetadataEntity,
  attachmentObjectMetadata: ObjectMetadataEntity,
  timelineActivityObjectMetadata: ObjectMetadataEntity,
  favoriteObjectMetadata: ObjectMetadataEntity,
  primaryKeyColumnType: string,
): Promise<WorkspaceMigrationTableAction[]> => {
  return [
    {
      name: computeObjectTargetTable(activityTargetObjectMetadata),
      action: WorkspaceMigrationTableActionType.ALTER,
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE,
          columnName: computeColumnName(createdObjectMetadata.nameSingular, {
            isForeignKey: true,
          }),
          columnType: primaryKeyColumnType,
          isNullable: true,
        } satisfies WorkspaceMigrationColumnCreate,
      ],
    },
    {
      name: computeObjectTargetTable(attachmentObjectMetadata),
      action: WorkspaceMigrationTableActionType.ALTER,
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE,
          columnName: computeColumnName(createdObjectMetadata.nameSingular, {
            isForeignKey: true,
          }),
          columnType: primaryKeyColumnType,
          isNullable: true,
        } satisfies WorkspaceMigrationColumnCreate,
      ],
    },
    {
      name: computeObjectTargetTable(timelineActivityObjectMetadata),
      action: WorkspaceMigrationTableActionType.ALTER,
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE,
          columnName: computeColumnName(createdObjectMetadata.nameSingular, {
            isForeignKey: true,
          }),
          columnType: primaryKeyColumnType,
          isNullable: true,
        } satisfies WorkspaceMigrationColumnCreate,
      ],
    },
    {
      name: computeObjectTargetTable(favoriteObjectMetadata),
      action: WorkspaceMigrationTableActionType.ALTER,
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE,
          columnName: computeColumnName(createdObjectMetadata.nameSingular, {
            isForeignKey: true,
          }),
          columnType: primaryKeyColumnType,
          isNullable: true,
        } satisfies WorkspaceMigrationColumnCreate,
      ],
    },
  ];
};
