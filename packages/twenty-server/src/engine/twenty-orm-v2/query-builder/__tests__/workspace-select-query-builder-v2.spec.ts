import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type CompiledStatement } from 'src/engine/twenty-orm-v2/sql/utils/compile-named-parameters.util';
import { TwentyOrmV2Exception } from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
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
    name: buildColumn('name'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'name', 'deletedAt'],
  relationShapeByFieldName: {},
  fieldIdByName: {},
  fieldIdByJoinColumnName: {},
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
    nameLastName: buildColumn('nameLastName', 'name'),
    companyId: buildColumn('companyId'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: [
    'id',
    'nameFirstName',
    'nameLastName',
    'companyId',
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
    people: {
      fieldName: 'people',
      fieldMetadataId: 'field-people',
      relationType: RelationType.ONE_TO_MANY,
      targetObjectMetadataId: 'company-object-id',
      targetFieldMetadataId: 'field-company',
    },
  },
  fieldIdByName: {},
  fieldIdByJoinColumnName: {},
  hasDeletedAtColumn: true,
};

const buildQueryBuilder = ({
  rows = [],
}: { rows?: Record<string, unknown>[] } = {}) => {
  const executedStatements: CompiledStatement[] = [];

  const queryBuilder = new WorkspaceSelectQueryBuilderV2('person', {
    tableShape: personTableShape,
    executor: {
      execute: async (statement) => {
        executedStatements.push(statement);

        return rows;
      },
    },
    tableShapeByObjectMetadataId: () => companyTableShape,
    onBeforeExecute: () => undefined,
    formatResult: (records) => records as never,
  });

  return { queryBuilder, executedStatements };
};

describe('WorkspaceSelectQueryBuilderV2', () => {
  it('should select the requested columns with alias-prefixed output names', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({
      select: { id: true, nameFirstName: true },
    });

    expect(queryBuilder.getQuery()).toBe(
      'SELECT "person"."id" AS "person_id", "person"."nameFirstName" AS "person_nameFirstName" ' +
        `FROM "${SCHEMA_NAME}"."person" AS "person" ` +
        'WHERE ("person"."deletedAt" IS NULL)',
    );
  });

  it('should compile named parameters coming from the shared filter parser', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .andWhere('"person"."nameFirstName" ILIKE :name7f3a', {
        name7f3a: '%ac%',
      });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('"person"."nameFirstName" ILIKE $1');
    expect(values).toEqual(['%ac%']);
  });

  it('should add the soft-delete predicate unless withDeleted was called', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    expect(queryBuilder.getQuery()).toContain('"person"."deletedAt" IS NULL');

    queryBuilder.withDeleted();
    expect(queryBuilder.getQuery()).not.toContain(
      '"person"."deletedAt" IS NULL',
    );
  });

  it('should join a to-one relation on its foreign key', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');

    expect(queryBuilder.getQuery()).toContain(
      `LEFT JOIN "${SCHEMA_NAME}"."company" AS "company" ` +
        'ON "person"."companyId" = "company"."id"',
    );
  });

  it('should refuse to join a to-many relation', () => {
    const { queryBuilder } = buildQueryBuilder();

    expect(() => queryBuilder.leftJoin('person.people', 'people')).toThrow(
      TwentyOrmV2Exception,
    );
  });

  it('should emit a plain LIMIT for take, with no distinct sub-select', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.leftJoin('person.company', 'company');
    queryBuilder.take(31);

    const sql = queryBuilder.getQuery();

    expect(sql).toContain('LIMIT 31');
    expect(sql).not.toContain('DISTINCT');
  });

  it('should render order by with direction and nulls handling', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.orderBy({
      'person.nameFirstName': { order: 'DESC', nulls: 'NULLS LAST' },
      'company.name': { order: 'ASC' },
    });

    expect(queryBuilder.getQuery()).toContain(
      'ORDER BY "person"."nameFirstName" DESC NULLS LAST, "company"."name" ASC',
    );
  });

  it('should reject a column that does not exist on the object', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { nonExistent: true } });

    expect(() => queryBuilder.getQuery()).toThrow(TwentyOrmV2Exception);
  });

  it('should nest a bracketed condition built by the shared parsers', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });
    queryBuilder.andWhere({
      whereFactory: (nested) => {
        nested.where('"person"."id" = :a', { a: 1 });
        nested.orWhere('"person"."id" = :b', { b: 2 });
      },
    });

    const [text, values] = queryBuilder.getQueryAndParameters();

    expect(text).toContain('(("person"."id" = $1) OR ("person"."id" = $2))');
    expect(values).toEqual([1, 2]);
  });

  it('should strip the alias prefix when mapping rows back to records', async () => {
    const { queryBuilder } = buildQueryBuilder({
      rows: [
        {
          person_id: 'person-1',
          person_nameFirstName: 'Ada',
          company_name: 'Acme',
        },
      ],
    });

    queryBuilder.setFindOptions({ select: { id: true, nameFirstName: true } });

    const records = await queryBuilder.getMany();

    expect(records).toEqual([
      { id: 'person-1', nameFirstName: 'Ada', company_name: 'Acme' },
    ]);
  });

  it('should report the columns it selected so permissions do not have to parse SQL', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true, companyId: true } });

    expect(queryBuilder.getSelectedColumnNames()).toEqual(['id', 'companyId']);
  });

  it('should keep a clone independent of the builder it came from', () => {
    const { queryBuilder } = buildQueryBuilder();

    queryBuilder.setFindOptions({ select: { id: true } });

    const clone = queryBuilder.clone();

    clone.andWhere('"person"."id" = :id', { id: 1 });

    expect(queryBuilder.getQuery()).not.toContain('"person"."id" = :id');
    expect(clone.getQuery()).toContain('"person"."id" = :id');
  });

  it('should send one parameterised statement to the executor', async () => {
    const { queryBuilder, executedStatements } = buildQueryBuilder();

    queryBuilder
      .setFindOptions({ select: { id: true } })
      .andWhere('"person"."nameFirstName" = :name', { name: 'Ada' });

    await queryBuilder.getMany();

    expect(executedStatements).toHaveLength(1);
    expect(executedStatements[0].text).toContain('$1');
    expect(executedStatements[0].values).toEqual(['Ada']);
  });
});
