import { typeormBuildCreateColumnSql } from './typeorm-build-create-column-sql.util';

describe('typeormBuildCreateColumnSql', () => {
  const table = { name: 'my_table' };

  it('should generate SQL for a simple text column', () => {
    const column = {
      name: 'col1',
      type: 'text',
      isArray: false,
      isNullable: false,
      default: undefined,
      generatedType: undefined,
      asExpression: undefined,
    };
    const sql = typeormBuildCreateColumnSql({ table, column });

    expect(sql).toBe('"col1" text NOT NULL');
  });

  it('should generate SQL for a text[] (array) column', () => {
    const column = {
      name: 'col2',
      type: 'text',
      isArray: true,
      isNullable: true,
      default: undefined,
      generatedType: undefined,
      asExpression: undefined,
    };
    const sql = typeormBuildCreateColumnSql({ table, column });

    expect(sql).toBe('"col2" text[]');
  });

  it('should generate SQL for an enum column', () => {
    const column = {
      name: 'col3',
      type: 'enum',
      isArray: false,
      isNullable: true,
      default: undefined,
      generatedType: undefined,
      asExpression: undefined,
    };
    const sql = typeormBuildCreateColumnSql({ table, column });

    expect(sql).toBe('"col3" "my_table_col3_enum"');
  });

  it('should generate SQL for an enum[] (array) column', () => {
    const column = {
      name: 'col4',
      type: 'enum',
      isArray: true,
      isNullable: false,
      default: undefined,
      generatedType: undefined,
      asExpression: undefined,
    };
    const sql = typeormBuildCreateColumnSql({ table, column });

    expect(sql).toBe('"col4" "my_table_col4_enum"[] NOT NULL');
  });

  it('should include default and nullability', () => {
    const column = {
      name: 'col5',
      type: 'text',
      isArray: false,
      isNullable: false,
      default: "'default'",
      generatedType: undefined,
      asExpression: undefined,
    };
    const sql = typeormBuildCreateColumnSql({ table, column });

    expect(sql).toBe('"col5" text NOT NULL DEFAULT \'default\'');
  });

  it('should include generatedType and asExpression', () => {
    const column = {
      name: 'col6',
      type: 'text',
      isArray: false,
      isNullable: true,
      default: undefined,
      generatedType: 'STORED' as const,
      asExpression: 'lower(col6)',
    };
    const sql = typeormBuildCreateColumnSql({ table, column });

    expect(sql).toBe('"col6" text GENERATED ALWAYS AS (lower(col6)) STORED');
  });
});
