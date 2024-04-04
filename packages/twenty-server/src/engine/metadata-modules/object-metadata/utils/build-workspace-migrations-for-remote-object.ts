import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationTableAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeCustomName } from 'src/engine/utils/compute-custom-name.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

const buildCommentForRemoteObjectForeignKey = (
  localObjectMetadataName: string,
  remoteObjectMetadataName: string,
  schema: string,
): string =>
  `@graphql({"totalCount":{"enabled": true},"foreign_keys":[{"local_name":"${localObjectMetadataName}Collection","local_columns":["${remoteObjectMetadataName}Id"],"foreign_name":"${remoteObjectMetadataName}","foreign_schema":"${schema}","foreign_table":"${remoteObjectMetadataName}","foreign_columns":["id"]}]})`;

export const buildWorkspaceMigrationsForRemoteObject = (
  createdObjectMetadata: ObjectMetadataEntity,
  activityTargetObjectMetadata: ObjectMetadataEntity,
  attachmentObjectMetadata: ObjectMetadataEntity,
  eventObjectMetadata: ObjectMetadataEntity,
  favoriteObjectMetadata: ObjectMetadataEntity,
  schema: string,
): WorkspaceMigrationTableAction[] => {
  const createdObjectName = createdObjectMetadata.nameSingular;

  return [
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
          action: WorkspaceMigrationColumnActionType.CREATE,
          columnName: `${computeCustomName(
            createdObjectMetadata.nameSingular,
            false,
          )}Id`,
          columnType: 'uuid',
        },
      ],
    },
    {
      name: computeObjectTargetTable(activityTargetObjectMetadata),
      action: 'alter',
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
          comment: buildCommentForRemoteObjectForeignKey(
            activityTargetObjectMetadata.nameSingular,
            createdObjectName,
            schema,
          ),
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
          action: WorkspaceMigrationColumnActionType.CREATE,
          columnName: `${computeCustomName(
            createdObjectMetadata.nameSingular,
            false,
          )}Id`,
          columnType: 'uuid',
        },
      ],
    },
    {
      name: computeObjectTargetTable(attachmentObjectMetadata),
      action: 'alter',
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
          comment: buildCommentForRemoteObjectForeignKey(
            attachmentObjectMetadata.nameSingular,
            createdObjectName,
            schema,
          ),
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
          action: WorkspaceMigrationColumnActionType.CREATE,
          columnName: `${computeCustomName(
            createdObjectMetadata.nameSingular,
            false,
          )}Id`,
          columnType: 'uuid',
        },
      ],
    },
    {
      name: computeObjectTargetTable(eventObjectMetadata),
      action: 'alter',
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
          comment: buildCommentForRemoteObjectForeignKey(
            eventObjectMetadata.nameSingular,
            createdObjectName,
            schema,
          ),
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
          action: WorkspaceMigrationColumnActionType.CREATE,
          columnName: `${computeCustomName(
            createdObjectMetadata.nameSingular,
            false,
          )}Id`,
          columnType: 'uuid',
        },
      ],
    },
    {
      name: computeObjectTargetTable(favoriteObjectMetadata),
      action: 'alter',
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
          comment: buildCommentForRemoteObjectForeignKey(
            favoriteObjectMetadata.nameSingular,
            createdObjectName,
            schema,
          ),
        },
      ],
    },
  ];
};
