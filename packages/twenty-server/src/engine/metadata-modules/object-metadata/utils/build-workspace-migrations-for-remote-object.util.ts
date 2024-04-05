import { DataSource } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationTableAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeCustomName } from 'src/engine/utils/compute-custom-name.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

const buildCommentForRemoteObjectForeignKey = async (
  localObjectMetadataName: string,
  remoteObjectMetadataName: string,
  schema: string,
  workspaceDataSource: DataSource | undefined,
): Promise<string> => {
  const existingComment = await workspaceDataSource?.query(
    `SELECT col_description('${schema}."${localObjectMetadataName}"'::regclass, 0)`,
  );

  if (!existingComment[0]?.col_description) {
    return `@graphql({"totalCount":{"enabled": true},"foreign_keys":[{"local_name":"${localObjectMetadataName}Collection","local_columns":["${remoteObjectMetadataName}Id"],"foreign_name":"${remoteObjectMetadataName}","foreign_schema":"${schema}","foreign_table":"${remoteObjectMetadataName}","foreign_columns":["id"]}]})`;
  }

  const commentWithoutGraphQL = existingComment[0].col_description
    .replace('@graphql(', '')
    .replace(')', '');
  const parsedComment = JSON.parse(commentWithoutGraphQL);

  const foreignKey = {
    local_name: `${localObjectMetadataName}Collection`,
    local_columns: [`${remoteObjectMetadataName}Id`],
    foreign_name: `${remoteObjectMetadataName}`,
    foreign_schema: schema,
    foreign_table: remoteObjectMetadataName,
    foreign_columns: ['id'],
  };

  if (parsedComment.foreign_keys) {
    parsedComment.foreign_keys.push(foreignKey);
  } else {
    parsedComment.foreign_keys = [foreignKey];
  }

  return `@graphql(${JSON.stringify(parsedComment)})`;
};

export const buildWorkspaceMigrationsForRemoteObject = async (
  createdObjectMetadata: ObjectMetadataEntity,
  activityTargetObjectMetadata: ObjectMetadataEntity,
  attachmentObjectMetadata: ObjectMetadataEntity,
  eventObjectMetadata: ObjectMetadataEntity,
  favoriteObjectMetadata: ObjectMetadataEntity,
  schema: string,
  remoteTablePrimaryKeyColumnType: string,
  workspaceDataSource: DataSource | undefined,
): Promise<WorkspaceMigrationTableAction[]> => {
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
          columnType: remoteTablePrimaryKeyColumnType,
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
          columnType: remoteTablePrimaryKeyColumnType,
        },
      ],
    },
    {
      name: computeObjectTargetTable(activityTargetObjectMetadata),
      action: 'alter',
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
          comment: await buildCommentForRemoteObjectForeignKey(
            activityTargetObjectMetadata.nameSingular,
            createdObjectName,
            schema,
            workspaceDataSource,
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
          columnType: remoteTablePrimaryKeyColumnType,
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
          columnType: remoteTablePrimaryKeyColumnType,
        },
      ],
    },
    {
      name: computeObjectTargetTable(attachmentObjectMetadata),
      action: 'alter',
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
          comment: await buildCommentForRemoteObjectForeignKey(
            attachmentObjectMetadata.nameSingular,
            createdObjectName,
            schema,
            workspaceDataSource,
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
          columnType: remoteTablePrimaryKeyColumnType,
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
          columnType: remoteTablePrimaryKeyColumnType,
        },
      ],
    },
    {
      name: computeObjectTargetTable(eventObjectMetadata),
      action: 'alter',
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
          comment: await buildCommentForRemoteObjectForeignKey(
            eventObjectMetadata.nameSingular,
            createdObjectName,
            schema,
            workspaceDataSource,
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
          columnType: remoteTablePrimaryKeyColumnType,
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
          columnType: remoteTablePrimaryKeyColumnType,
        },
      ],
    },
    {
      name: computeObjectTargetTable(favoriteObjectMetadata),
      action: 'alter',
      columns: [
        {
          action: WorkspaceMigrationColumnActionType.CREATE_COMMENT,
          comment: await buildCommentForRemoteObjectForeignKey(
            favoriteObjectMetadata.nameSingular,
            createdObjectName,
            schema,
            workspaceDataSource,
          ),
        },
      ],
    },
  ];
};
