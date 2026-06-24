import { type NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

const PRODUCTION_MIGRATION_LOCK_TIMEOUT = "SET LOCAL lock_timeout = '8s'";
const TEST_MIGRATION_LOCK_TIMEOUT = "SET LOCAL lock_timeout = '15s'";

// Integration tests use the real BullMQ driver, so a mutation's side-effect jobs
// keep running asynchronously after the request returns and briefly hold locks on
// the workspace tables a schema migration needs. Production fails fast on an 8s
// lock_timeout; in tests we give the migration longer to wait those short-lived
// jobs out, so it doesn't flake with a lock timeout. Only the migration's own
// lock_timeout statement is rewritten — every other query is left untouched, and
// no production code changes.
export const relaxMigrationLockTimeoutForTests = (
  app: NestExpressApplication,
): void => {
  const dataSource = app.get(DataSource);
  const createQueryRunner = dataSource.createQueryRunner.bind(dataSource);

  dataSource.createQueryRunner = (mode) => {
    const queryRunner = createQueryRunner(mode);
    const query = queryRunner.query.bind(queryRunner);

    // Pass every argument through untouched; only swap the SQL of the migration's
    // own lock_timeout statement so the wrapper can't affect any other query.
    queryRunner.query = ((...args: Parameters<typeof query>) => {
      const [sql, ...rest] = args;

      if (typeof sql === 'string' && sql.trim() === PRODUCTION_MIGRATION_LOCK_TIMEOUT) {
        return query(TEST_MIGRATION_LOCK_TIMEOUT, ...rest);
      }

      return query(...args);
    }) as typeof queryRunner.query;

    return queryRunner;
  };
};
