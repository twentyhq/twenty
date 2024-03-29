import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationTableAction,
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnCreate,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeCustomName } from 'src/engine/utils/compute-custom-name.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

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
          comment: `@graphql({"totalCount":{"enabled": true},"foreign_keys":[{"local_name":"${activityTargetObjectMetadata.nameSingular}Collection","local_columns":["${createdObjectName}Id"],"foreign_name":"${createdObjectName}","foreign_schema":"${schema}","foreign_table":"${createdObjectName}","foreign_columns":["id"]}]})`,
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
          comment: `@graphql({"totalCount":{"enabled": true},"foreign_keys":[{"local_name":"${attachmentObjectMetadata.nameSingular}Collection","local_columns":["${createdObjectName}Id"],"foreign_name":"${createdObjectName}","foreign_schema":"${schema}","foreign_table":"${createdObjectName}","foreign_columns":["id"]}]})`,
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
          comment: `@graphql({"totalCount":{"enabled": true},"foreign_keys":[{"local_name":"${eventObjectMetadata.nameSingular}Collection","local_columns":["${createdObjectName}Id"],"foreign_name":"${createdObjectName}","foreign_schema":"${schema}","foreign_table":"${createdObjectName}","foreign_columns":["id"]}]})`,
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
          comment: `@graphql({"totalCount":{"enabled": true},"foreign_keys":[{"local_name":"${favoriteObjectMetadata.nameSingular}Collection","local_columns":["${createdObjectName}Id"],"foreign_name":"${createdObjectName}","foreign_schema":"${schema}","foreign_table":"${createdObjectName}","foreign_columns":["id"]}]})`,
        },
      ],
    },
  ];
};
