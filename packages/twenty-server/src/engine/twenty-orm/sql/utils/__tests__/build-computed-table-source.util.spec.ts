import { buildComputedTableSource } from 'src/engine/twenty-orm/sql/utils/build-computed-table-source.util';

describe('buildComputedTableSource', () => {
  it('returns the table itself when no computed column is used', () => {
    expect(
      buildComputedTableSource({
        tableExpression: '"workspace"."company"',
        alias: 'company',
        computedColumnSqlByColumnName: {},
      }),
    ).toBe('"workspace"."company"');
  });

  it('exposes computed columns next to the stored ones', () => {
    expect(
      buildComputedTableSource({
        tableExpression: '"workspace"."company"',
        alias: 'company',
        computedColumnSqlByColumnName: {
          peopleCount: 'SELECT COUNT(*) FROM people',
          doubleEmployees: '"company"."employees" * 2',
        },
      }),
    ).toBe(
      '(SELECT "company".*, (SELECT COUNT(*) FROM people) AS "peopleCount", ("company"."employees" * 2) AS "doubleEmployees" FROM "workspace"."company" AS "company")',
    );
  });

  it('computes a column above the computed columns it reads', () => {
    expect(
      buildComputedTableSource({
        tableExpression: '"workspace"."company"',
        alias: 'company',
        computedColumnSqlByColumnName: {
          employeesPerPerson: '"company"."employees" / "company"."peopleCount"',
          peopleCount: 'SELECT COUNT(*) FROM people',
        },
      }),
    ).toBe(
      '(SELECT "company".*, ("company"."employees" / "company"."peopleCount") AS "employeesPerPerson" FROM (SELECT "company".*, (SELECT COUNT(*) FROM people) AS "peopleCount" FROM "workspace"."company" AS "company") AS "company")',
    );
  });

  it('refuses computed columns that read each other', () => {
    expect(() =>
      buildComputedTableSource({
        tableExpression: '"workspace"."company"',
        alias: 'company',
        computedColumnSqlByColumnName: {
          first: '"company"."second"',
          second: '"company"."first"',
        },
      }),
    ).toThrow('depends on itself');
  });
});
