import { FieldMetadataType } from 'twenty-shared/types';

import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type CompiledStatement } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

type WorkspaceRepositoryOptions = ConstructorParameters<
  typeof WorkspaceRepository
>[0];

const buildColumn = (columnName: string) => ({
  columnName,
  fieldMetadataId: `field-${columnName}`,
  fieldName: columnName,
  fieldMetadataType: FieldMetadataType.TEXT,
});

const messageTableShape: WorkspaceTableShape = {
  objectMetadataId: 'message-object-id',
  nameSingular: 'message',
  schemaName: 'workspace_1wgvd1injqtife6y4rvfbu3h5',
  tableName: 'message',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    subject: buildColumn('subject'),
    updatedAt: buildColumn('updatedAt'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'subject', 'updatedAt', 'deletedAt'],
  relationShapeByFieldName: {},
  hasDeletedAtColumn: true,
};

const buildRepository = ({
  shouldBypassPermissionChecks,
}: {
  shouldBypassPermissionChecks: boolean;
}) => {
  const executedStatements: CompiledStatement[] = [];

  const repository = new WorkspaceRepository({
    tableShape: messageTableShape,
    flatObjectMetadata: {
      id: messageTableShape.objectMetadataId,
      nameSingular: messageTableShape.nameSingular,
    },
    internalContext: {
      workspaceId: 'workspace-id',
      featureFlagsMap: {},
      flatObjectMetadataMaps: {},
      flatFieldMetadataMaps: {},
    },
    executor: {
      execute: async (statement: CompiledStatement) => {
        executedStatements.push(statement);

        return [];
      },
    },
    objectRecordsPermissions: {},
    shouldBypassPermissionChecks,
    shouldSkipEventEmission: true,
    tableShapeByObjectMetadataId: () => messageTableShape,
  } as unknown as WorkspaceRepositoryOptions);

  return { repository, executedStatements };
};

describe('WorkspaceRepository query builder mutations', () => {
  it.each(['update', 'delete', 'softDelete', 'restore'] as const)(
    'should execute a query builder %s on a repository that bypasses permission checks',
    async (method) => {
      const { repository, executedStatements } = buildRepository({
        shouldBypassPermissionChecks: true,
      });

      await repository
        .createQueryBuilder()
        .where({ id: 'message-id' })
        [method]()
        .returning(['id'])
        .execute();

      expect(executedStatements).toHaveLength(1);
    },
  );

  it.each(['update', 'delete', 'softDelete', 'restore'] as const)(
    'should refuse a query builder %s on a permission-scoped repository',
    async (method) => {
      const { repository, executedStatements } = buildRepository({
        shouldBypassPermissionChecks: false,
      });

      await expect(
        repository
          .createQueryBuilder()
          .where({ id: 'message-id' })
          [method]()
          .returning(['id'])
          .execute(),
      ).rejects.toThrow(PermissionsException);
      expect(executedStatements).toHaveLength(0);
    },
  );
});
