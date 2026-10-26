import { type Pool, type PoolClient } from 'pg';

import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

export const acquireRecordPermissionConnection = (
  pool: Pool,
): Promise<PoolClient> => {
  const capacityError = () =>
    new TwentyOrmException(
      'Record query connection capacity is temporarily exhausted',
      TwentyOrmExceptionCode.TRANSIENT_DATABASE_ERROR,
    );
  if (pool.waitingCount >= 32) return Promise.reject(capacityError());
  return new Promise((resolve, reject) => {
    let expired = false;
    const timer = setTimeout(() => {
      expired = true;
      reject(capacityError());
    }, 250);
    pool.connect().then(
      (client) => {
        clearTimeout(timer);
        // node-postgres cannot remove a queued checkout; release it if the caller has already timed out.
        if (expired) client.release();
        else resolve(client);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
};
