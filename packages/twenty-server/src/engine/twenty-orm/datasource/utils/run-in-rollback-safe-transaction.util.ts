import { Logger } from '@nestjs/common';

import { type Pool, type PoolClient } from 'pg';

import { computeTwentyOrmException } from 'src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util';

const logger = new Logger('runInRollbackSafeTransaction');

export const runInRollbackSafeTransaction = async <T>({
  pool,
  work,
}: {
  pool: Pool;
  work: (client: PoolClient) => Promise<T>;
}): Promise<T> => {
  const client = await pool.connect().catch((error: unknown) => {
    throw computeTwentyOrmException(error);
  });
  let shouldDestroyConnection = false;

  try {
    await client.query('BEGIN');

    const result = await work(client);

    await client.query('COMMIT');

    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      shouldDestroyConnection = true;

      logger.warn(
        `Destroying connection after failed transaction ROLLBACK: ${
          rollbackError instanceof Error
            ? rollbackError.message
            : String(rollbackError)
        }`,
      );
    }

    throw computeTwentyOrmException(error);
  } finally {
    client.release(shouldDestroyConnection);
  }
};
