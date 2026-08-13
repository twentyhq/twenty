import { FieldMetadataType } from 'twenty-shared/types';

import { TwentyOrmV2Exception } from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { applyMutationCriteriaToQueryBuilder } from 'src/engine/twenty-orm-v2/query-builder/utils/apply-mutation-criteria.util';
import { WorkspaceSelectQueryBuilderV2 } from 'src/engine/twenty-orm-v2/query-builder/workspace-select-query-builder-v2';
import { type WorkspaceTableShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const buildColumn = (columnName: string) => ({
  columnName,
  fieldMetadataId: `field-${columnName}`,
  fieldName: columnName,
  fieldMetadataType: FieldMetadataType.TEXT,
});

const personTableShape: WorkspaceTableShape = {
  objectMetadataId: 'person-object-id',
  nameSingular: 'person',
  schemaName: 'workspace_test',
  tableName: 'person',
  columnShapeByColumnName: {
    id: buildColumn('id'),
    name: buildColumn('name'),
    deletedAt: buildColumn('deletedAt'),
  },
  columnNames: ['id', 'name', 'deletedAt'],
  relationShapeByFieldName: {},
  hasDeletedAtColumn: true,
};

const buildQueryBuilder = () =>
  new WorkspaceSelectQueryBuilderV2('person', {
    tableShape: personTableShape,
    executor: { execute: async () => [] },
    objectRecordsPermissions: {},
    tableShapeByObjectMetadataId: () => personTableShape,
    onBeforeExecute: () => undefined,
    formatResult: (records) => records as never,
  });

describe('applyMutationCriteriaToQueryBuilder', () => {
  it('turns a bare id into an equality predicate', () => {
    const [text, values] = applyMutationCriteriaToQueryBuilder(
      buildQueryBuilder(),
      'record-id',
    ).getQueryAndParameters();

    expect(text).toContain('"person"."id" = $1');
    expect(values).toContain('record-id');
  });

  it('turns a list of ids into an IN predicate', () => {
    const [text, values] = applyMutationCriteriaToQueryBuilder(
      buildQueryBuilder(),
      ['a', 'b'],
    ).getQueryAndParameters();

    expect(text).toContain('"person"."id" IN ($1, $2)');
    expect(values).toEqual(expect.arrayContaining(['a', 'b']));
  });

  it('applies a where object', () => {
    const [text, values] = applyMutationCriteriaToQueryBuilder(
      buildQueryBuilder(),
      { name: 'Twenty' },
    ).getQueryAndParameters();

    expect(text).toContain('"person"."name" = $1');
    expect(values).toContain('Twenty');
  });

  it('treats a where array as an OR', () => {
    const [text] = applyMutationCriteriaToQueryBuilder(buildQueryBuilder(), [
      { name: 'A' },
      { name: 'B' },
    ]).getQueryAndParameters();

    expect(text).toContain('OR');
  });

  it('throws on an empty criteria array', () => {
    expect(() =>
      applyMutationCriteriaToQueryBuilder(buildQueryBuilder(), []),
    ).toThrow(TwentyOrmV2Exception);
  });
});
