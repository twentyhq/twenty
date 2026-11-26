import { type QueryRunner } from 'typeorm';

import { RelaxViewDeletedAtFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-65/2-65-instance-command-fast-1795704573519-relax-view-deleted-at';

jest.useRealTimers();

describe('2-65 instance command 1795704573519 - relax view deletedAt (integration)', () => {
  const relaxDeletedAtCommand = new RelaxViewDeletedAtFastInstanceCommand();
  let queryRunner: QueryRunner;

  const findUniqueIndexDefinitions = async (): Promise<string[]> => {
    const rows: { indexdef: string }[] = await queryRunner.query(
      `SELECT indexdef FROM pg_indexes
        WHERE schemaname = 'core'
          AND indexname IN (
            'IDX_VIEW_FIELD_FIELD_METADATA_ID_VIEW_ID_UNIQUE',
            'IDX_VIEW_SORT_FIELD_METADATA_ID_VIEW_ID_UNIQUE'
          )
        ORDER BY indexname`,
    );

    return rows.map(({ indexdef }) => indexdef);
  };

  beforeEach(async () => {
    queryRunner = globalThis.testDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await relaxDeletedAtCommand.down(queryRunner);
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  it('rebuilds the unique indexes without the deletedAt condition', async () => {
    await relaxDeletedAtCommand.up(queryRunner);

    const [viewFieldIndex, viewSortIndex] = await findUniqueIndexDefinitions();

    expect(viewFieldIndex).not.toContain('deletedAt');
    expect(viewFieldIndex).toContain('"isCanonical" = true');
    expect(viewSortIndex).not.toContain('deletedAt');
    expect(viewSortIndex).not.toContain('WHERE');
  });

  it('restores the deletedAt condition on down', async () => {
    const [viewFieldIndex, viewSortIndex] = await findUniqueIndexDefinitions();

    expect(viewFieldIndex).toContain('"deletedAt" IS NULL');
    expect(viewSortIndex).toContain('"deletedAt" IS NULL');
  });
});
