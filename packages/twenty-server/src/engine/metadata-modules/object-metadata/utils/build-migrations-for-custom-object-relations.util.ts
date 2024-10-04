import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const buildMigrationsForCustomObjectRelations = (
  createdObjectMetadata: ObjectMetadataEntity,
  activityTargetObjectMetadata: ObjectMetadataEntity,
  attachmentObjectMetadata: ObjectMetadataEntity,
  timelineActivityObjectMetadata: ObjectMetadataEntity,
  favoriteObjectMetadata: ObjectMetadataEntity,
  noteTargetObjectMetadata: ObjectMetadataEntity,
  taskTargetObjectMetadata: ObjectMetadataEntity,
): WorkspaceMigrationTableAction[] => [
  // Add activity target relation
  {
    name: computeObjectTargetTable(activityTargetObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        columnType: 'uuid',
        isNullable: true,
        defaultValue: null,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(activityTargetObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  // Add note target relation
  {
    name: computeObjectTargetTable(noteTargetObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        columnType: 'uuid',
        isNullable: true,
        defaultValue: null,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(noteTargetObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  // Add task target relation
  {
    name: computeObjectTargetTable(taskTargetObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        columnType: 'uuid',
        isNullable: true,
        defaultValue: null,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(taskTargetObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  // Add attachment relation
  {
    name: computeObjectTargetTable(attachmentObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        columnType: 'uuid',
        isNullable: true,
        defaultValue: null,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(attachmentObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  // Add timeline activity relation
  {
    name: computeObjectTargetTable(timelineActivityObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        columnType: 'uuid',
        isNullable: true,
        defaultValue: null,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(timelineActivityObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
  // Add favorite relation
  {
    name: computeObjectTargetTable(favoriteObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        columnType: 'uuid',
        isNullable: true,
        defaultValue: null,
      } satisfies WorkspaceMigrationColumnCreate,
    ],
  },
  {
    name: computeObjectTargetTable(favoriteObjectMetadata),
    action: WorkspaceMigrationTableActionType.ALTER,
    columns: [
      {
        action: WorkspaceMigrationColumnActionType.CREATE_FOREIGN_KEY,
        columnName: computeColumnName(createdObjectMetadata.nameSingular, {
          isForeignKey: true,
        }),
        referencedTableName: computeObjectTargetTable(createdObjectMetadata),
        referencedTableColumnName: 'id',
        onDelete: RelationOnDeleteAction.CASCADE,
      },
    ],
  },
];
