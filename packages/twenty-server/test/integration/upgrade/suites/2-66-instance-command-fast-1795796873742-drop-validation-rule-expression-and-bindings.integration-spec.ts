import { type QueryRunner } from 'typeorm';

import { DropValidationRuleExpressionAndBindingsFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-instance-command-fast-1795796873742-drop-validation-rule-expression-and-bindings';

jest.useRealTimers();

describe('2-66 instance command 1795796873742 - drop validation rule expression and bindings (integration)', () => {
  const dropExpressionAndBindingsCommand =
    new DropValidationRuleExpressionAndBindingsFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findLegacyColumns = (): Promise<
    {
      columnName: string;
      dataType: string;
      isNullable: string;
      columnDefault: string | null;
    }[]
  > =>
    queryRunner.query(
      `SELECT column_name AS "columnName", data_type AS "dataType",
              is_nullable AS "isNullable", column_default AS "columnDefault"
         FROM information_schema.columns
        WHERE table_schema = 'core' AND table_name = 'validationRule'
          AND column_name IN ('expression', 'bindings')
        ORDER BY column_name`,
    );

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('drops the expression and bindings columns', async () => {
    await dropExpressionAndBindingsCommand.up(queryRunner);

    expect(await findLegacyColumns()).toEqual([]);
  });

  it('restores both columns as they were in 2.65 on down', async () => {
    await dropExpressionAndBindingsCommand.up(queryRunner);
    await dropExpressionAndBindingsCommand.down(queryRunner);

    expect(await findLegacyColumns()).toEqual([
      {
        columnName: 'bindings',
        dataType: 'jsonb',
        isNullable: 'NO',
        columnDefault: "'{}'::jsonb",
      },
      {
        columnName: 'expression',
        dataType: 'text',
        isNullable: 'YES',
        columnDefault: null,
      },
    ]);
  });

  it('drops the restored columns again on up', async () => {
    await dropExpressionAndBindingsCommand.up(queryRunner);
    await dropExpressionAndBindingsCommand.down(queryRunner);
    await dropExpressionAndBindingsCommand.up(queryRunner);

    expect(await findLegacyColumns()).toEqual([]);
  });
});
