import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  WorkspaceMigrationTableAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeCustomName } from 'src/engine/utils/compute-custom-name.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const buildWorkspaceMigrationsForCustomObject = (
  createdObjectMetadata: ObjectMetadataEntity,
  activityTargetObjectMetadata: ObjectMetadataEntity,
  attachmentObjectMetadata: ObjectMetadataEntity,
  eventObjectMetadata: ObjectMetadataEntity,
  favoriteObjectMetadata: ObjectMetadataEntity,
): WorkspaceMigrationTableAction[] => [
  {
    name: computeObjectTargetTable(createdObjectMetadata),
    action: 'create',
  } satisfies WorkspaceMigrationTableAction,
  // Add activity target relation
  {
    name: computeObjectTargetTable(activityTargetObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: `${computeCustomName(
          createdObjectMetadata.nameSingular,
          false,
        )}Id`,
        columnType: 'uuid',
        isNullable: true,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(activityTargetObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: `${computeCustomName(
          createdObjectMetadata.nameSingular,
          false,
        )}Id`,
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  // Add attachment relation
  {
    name: computeObjectTargetTable(attachmentObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: `${computeCustomName(
          createdObjectMetadata.nameSingular,
          false,
        )}Id`,
        columnType: 'uuid',
        isNullable: true,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(attachmentObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: `${computeCustomName(
          createdObjectMetadata.nameSingular,
          false,
        )}Id`,
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  // Add event relation
  {
    name: computeObjectTargetTable(eventObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: `${computeCustomName(
          createdObjectMetadata.nameSingular,
          false,
        )}Id`,
        columnType: 'uuid',
        isNullable: true,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(eventObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: `${computeCustomName(
          createdObjectMetadata.nameSingular,
          false,
        )}Id`,
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  // Add favorite relation
  {
    name: computeObjectTargetTable(favoriteObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: `${computeCustomName(
          createdObjectMetadata.nameSingular,
          false,
        )}Id`,
        columnType: 'uuid',
        isNullable: true,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(favoriteObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: `${computeCustomName(
          createdObjectMetadata.nameSingular,
          false,
        )}Id`,
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  {
    name: computeObjectTargetTable(createdObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: 'position',
        columnType: 'float',
        isNullable: true,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  } satisfies WorkspaceMigrationTableAction,
  // This is temporary until we implement mainIdentifier
  {
    name: computeObjectTargetTable(createdObjectMetadata),
    action: 'alter',
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: 'name',
        columnType: 'text',
        defaultValue: "'Untitled'",
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  } satisfies WorkspaceMigrationTableAction,
];
