import { type QueryRunner } from 'typeorm';

import { DropViewDeletedAtFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-66/2-66-instance-command-fast-1795795870500-drop-view-deleted-at';

jest.useRealTimers();

const VIEW_TABLE_NAMES = [
  'view',
  'viewField',
  'viewFieldGroup',
  'viewFilter',
  'viewFilterGroup',
  'viewGroup',
  'viewSort',
];

describe('2-66 instance command 1795795870500 - drop view deletedAt (integration)', () => {
  const dropDeletedAtCommand = new DropViewDeletedAtFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findTablesWithDeletedAt = async (): Promise<string[]> => {
    const rows: { tableName: string }[] = await queryRunner.query(
      `SELECT table_name AS "tableName"
         FROM information_schema.columns
        WHERE table_schema = 'core'
          AND table_name = ANY($1)
          AND column_name = 'deletedAt'`,
      [VIEW_TABLE_NAMES],
    );

    return rows.map(({ tableName }) => tableName).sort();
  };

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('drops deletedAt from every view table', async () => {
    await dropDeletedAtCommand.up(queryRunner);

    expect(await findTablesWithDeletedAt()).toEqual([]);
  });

  it('restores deletedAt on every view table on down', async () => {
    await dropDeletedAtCommand.up(queryRunner);
    await dropDeletedAtCommand.down(queryRunner);

    expect(await findTablesWithDeletedAt()).toEqual(
      [...VIEW_TABLE_NAMES].sort(),
    );
  });

  it('drops the restored columns again on up', async () => {
    await dropDeletedAtCommand.up(queryRunner);
    await dropDeletedAtCommand.down(queryRunner);
    await dropDeletedAtCommand.up(queryRunner);

    expect(await findTablesWithDeletedAt()).toEqual([]);
  });
});
