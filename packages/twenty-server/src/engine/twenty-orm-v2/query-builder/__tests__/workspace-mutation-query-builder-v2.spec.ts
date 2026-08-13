import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { TwentyOrmV2Exception } from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const SCHEMA_NAME = 'workspace_1wgvd1injqtife6y4rvfbu3h5';

const buildColumn = (
  columnName: string,
  compositeParentFieldName?: string,
) => ({
  columnName,
  fieldMetadataId: `field-${columnName}`,
  fieldName: compositeParentFieldName ?? columnName,
  fieldMetadataType: FieldMetadataType.TEXT,
  ...(compositeParentFieldName !== undefined
    ? { compositeParentFieldName }
    : {}),
});

const companyTableShape: WorkspaceTableShape = {
  objectMetadataId: 'company-object-id',
  nameSingular: 'company',
  schemaName: SCHEMA_NAME,
  tableName: 'company',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'deletedAt'],
  relationShapeByFieldName: {},
  hasDeletedAtColumn: true,
};

const personTableShape: WorkspaceTableShape = {
  objectMetadataId: 'person-object-id',
  nameSingular: 'person',
  schemaName: SCHEMA_NAME,
  tableName: 'person',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    nameFirstName: buildColumn('nameFirstName', 'name'),
    jobTitle: buildColumn('jobTitle'),
    companyId: buildColumn('companyId'),
    updatedAt: buildColumn('updatedAt'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: [
    'id',
    'nameFirstName',
    'jobTitle',
    'companyId',
    'updatedAt',
    'deletedAt',
  ],
  relationShapeByFieldName: {
    company: {
      fieldName: 'company',
      fieldMetadataId: 'field-company',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'company-object-id',
      targetFieldMetadataId: 'field-people',
      joinColumnName: 'companyId',
    },
  },
  hasDeletedAtColumn: true,
};

const buildBuilders = ({
  rows = [],
}: { rows?: Record<string, unknown>[] } = {}) => {
  const executedStatements: CompiledStatement[] = [];

  const selectQueryBuilder = new WorkspaceSelectQueryBuilderV2('person', {
    tableShape: personTableShape,
    executor: {
      execute: async (statement) => {
        executedStatements.push(statement);

        return rows;
      },
    },
    objectRecordsPermissions: {},
    tableShapeByObjectMetadataId: () => companyTableShape,
    onBeforeExecute: () => undefined,
    formatResult: (records) => records as never,
  });

  return { selectQueryBuilder, executedStatements };
};

describe('WorkspaceMutationQueryBuilderV2', () => {
  it('should build a soft delete that stamps deletedAt and updatedAt', () => {
    const { selectQueryBuilder } = buildBuilders();

    const mutationQueryBuilder = selectQueryBuilder
      .where('"person"."id" IN (:...ids)', {
        ids: ['id-1', 'id-2'],
      })
      .softDelete()
      .returning(['id', 'nameFirstName']);

    expect(mutationQueryBuilder.getQuery()).toBe(
      `UPDATE "${SCHEMA_NAME}"."person" AS "person" ` +
        'SET "deletedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP ' +
        'WHERE ("person"."id" IN (:...ids)) ' +
        'RETURNING "person"."id" AS "person_id", "person"."nameFirstName" AS "person_nameFirstName"',
    );
  });

  it('should build a restore that clears deletedAt and stamps updatedAt', () => {
    const { selectQueryBuilder } = buildBuilders();

    const mutationQueryBuilder = selectQueryBuilder
      .where('"person"."id" IN (:...ids)', { ids: ['id-1'] })
      .restore()
      .returning(['id']);

    expect(mutationQueryBuilder.getQuery()).toBe(
      `UPDATE "${SCHEMA_NAME}"."person" AS "person" ` +
        'SET "deletedAt" = NULL, "updatedAt" = CURRENT_TIMESTAMP ' +
        'WHERE ("person"."id" IN (:...ids)) ' +
        'RETURNING "person"."id" AS "person_id"',
    );
  });

  it('should build a hard delete with no SET clause', () => {
    const { selectQueryBuilder } = buildBuilders();

    const mutationQueryBuilder = selectQueryBuilder
      .where('"person"."id" IN (:...ids)', { ids: ['id-1'] })
      .delete()
      .returning(['id']);

    expect(mutationQueryBuilder.getQuery()).toBe(
      `DELETE FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE ("person"."id" IN (:...ids)) ' +
        'RETURNING "person"."id" AS "person_id"',
    );
  });

  it('should build an update that binds set values and appends updatedAt maintenance', () => {
    const { selectQueryBuilder } = buildBuilders();

    const [sql, values] = selectQueryBuilder
      .where('"person"."id" IN (:...ids)', { ids: ['id-1'] })
      .update()
      .set({ jobTitle: 'Tech Lead' })
      .returning(['id', 'jobTitle'])
      .getQueryAndParameters();

    expect(sql).toBe(
      `UPDATE "${SCHEMA_NAME}"."person" AS "person" ` +
        'SET "jobTitle" = $1, "updatedAt" = CURRENT_TIMESTAMP ' +
        'WHERE ("person"."id" IN ($2)) ' +
        'RETURNING "person"."id" AS "person_id", "person"."jobTitle" AS "person_jobTitle"',
    );
    expect(values).toEqual(['Tech Lead', 'id-1']);
  });

  it('should not append updatedAt maintenance when the caller sets updatedAt itself', () => {
    const { selectQueryBuilder } = buildBuilders();

    const [sql, values] = selectQueryBuilder
      .where('"person"."id" = :id', { id: 'id-1' })
      .update()
      .set({ jobTitle: 'Tech Lead', updatedAt: null })
      .returning(['id'])
      .getQueryAndParameters();

    expect(sql).toBe(
      `UPDATE "${SCHEMA_NAME}"."person" AS "person" ` +
        'SET "jobTitle" = $1, "updatedAt" = $2 ' +
        'WHERE ("person"."id" = $3) ' +
        'RETURNING "person"."id" AS "person_id"',
    );
    expect(values).toEqual(['Tech Lead', null, 'id-1']);
  });

  it('should return formatted rows from execute', async () => {
    const { selectQueryBuilder, executedStatements } = buildBuilders({
      rows: [{ person_id: 'id-1' }, { person_id: 'id-2' }],
    });

    const result = await selectQueryBuilder
      .where('"person"."id" IN (:...ids)', { ids: ['id-1', 'id-2'] })
      .softDelete()
      .returning(['id'])
      .execute();

    expect(result.generatedMaps).toEqual([{ id: 'id-1' }, { id: 'id-2' }]);
    expect(executedStatements).toHaveLength(1);
    expect(executedStatements[0].values).toEqual(['id-1', 'id-2']);
  });

  it('should not overwrite a where parameter that collides with a set parameter name', () => {
    const { selectQueryBuilder } = buildBuilders();

    const [, values] = selectQueryBuilder
      .where('"person"."id" = :ormV2Set_0', { ormV2Set_0: 'id-1' })
      .update()
      .set({ jobTitle: 'Tech Lead' })
      .returning(['id'])
      .getQueryAndParameters();

    expect(values).toContain('id-1');
    expect(values).toContain('Tech Lead');
  });

  it('should reject a soft delete on a table without a deletedAt column', () => {
    const shapeWithoutDeletedAt: WorkspaceTableShape = {
      ...personTableShape,
      columnShapeByColumnName: {
        id: buildColumn('id'),
        updatedAt: buildColumn('updatedAt'),
      },
      columnNames: ['id', 'updatedAt'],
      hasDeletedAtColumn: false,
    };

    const selectQueryBuilder = new WorkspaceSelectQueryBuilderV2('person', {
      tableShape: shapeWithoutDeletedAt,
      executor: { execute: async () => [] },
      objectRecordsPermissions: {},
      tableShapeByObjectMetadataId: () => companyTableShape,
      onBeforeExecute: () => undefined,
      formatResult: (records) => records as never,
    });

    expect(() =>
      selectQueryBuilder
        .where('"person"."id" = :id', { id: 'id-1' })
        .softDelete()
        .returning(['id'])
        .getQuery(),
    ).toThrow(TwentyOrmV2Exception);
  });

  it('should reject setting a column that does not exist', () => {
    const { selectQueryBuilder } = buildBuilders();

    expect(() =>
      selectQueryBuilder
        .where('"person"."id" = :id', { id: 'id-1' })
        .update()
        .set({ missingColumn: 'x' })
        .returning(['id'])
        .getQuery(),
    ).toThrow(TwentyOrmV2Exception);
  });

  it('should bump only updatedAt for an update carrying no columns', () => {
    const { selectQueryBuilder } = buildBuilders();

    expect(
      selectQueryBuilder
        .where('"person"."id" = :id', { id: 'id-1' })
        .update()
        .returning(['id'])
        .getQuery(),
    ).toBe(
      `UPDATE "${SCHEMA_NAME}"."person" AS "person" ` +
        'SET "updatedAt" = CURRENT_TIMESTAMP ' +
        'WHERE ("person"."id" = :id) ' +
        'RETURNING "person"."id" AS "person_id"',
    );
  });

  it('should reject an update that would emit no SET clause', () => {
    const shapeWithoutUpdatedAt: WorkspaceTableShape = {
      ...personTableShape,
      columnShapeByColumnName: {
        id: buildColumn('id'),
        deletedAt: buildColumn('deletedAt'),
      },
      columnNames: ['id', 'deletedAt'],
    };

    const selectQueryBuilder = new WorkspaceSelectQueryBuilderV2('person', {
      tableShape: shapeWithoutUpdatedAt,
      executor: { execute: async () => [] },
      objectRecordsPermissions: {},
      tableShapeByObjectMetadataId: () => companyTableShape,
      onBeforeExecute: () => undefined,
      formatResult: (records) => records as never,
    });

    expect(() =>
      selectQueryBuilder
        .where('"person"."id" = :id', { id: 'id-1' })
        .update()
        .returning(['id'])
        .getQuery(),
    ).toThrow(TwentyOrmV2Exception);
  });

  it('should refuse to morph a query that carries a relation join', () => {
    const { selectQueryBuilder } = buildBuilders();

    selectQueryBuilder.leftJoin('person.company', 'company');

    expect(() => selectQueryBuilder.softDelete()).toThrow(TwentyOrmV2Exception);
  });
});
