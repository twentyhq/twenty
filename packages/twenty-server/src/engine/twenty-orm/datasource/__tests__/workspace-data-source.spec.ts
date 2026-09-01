import { type Pool, type PoolClient } from 'pg';
import { type ObjectLiteral } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace-data-source';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type DatabaseBatchEventInput } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const OBJECT_METADATA_ID = '20202020-13f7-4b01-87bc-4152b8583f74';
const OBJECT_METADATA_UNIVERSAL_IDENTIFIER =
  '20202020-4a45-4aa4-906d-69d05ee0e156';
const OBJECT_NAME = 'widget';

const flatObjectMetadata = {
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: 'custom-application',
  nameSingular: OBJECT_NAME,
  namePlural: 'widgets',
  fieldIds: [],
  isCustom: true,
} as unknown as FlatObjectMetadata;

const buildDatabaseEvent = (
  objectMetadataNameSingular: string,
): DatabaseBatchEventInput<ObjectLiteral, DatabaseEventAction.CREATED> =>
  ({
    objectMetadataNameSingular,
    action: DatabaseEventAction.CREATED,
    events: [{}],
    objectMetadata: flatObjectMetadata,
    workspaceId: WORKSPACE_ID,
  }) as DatabaseBatchEventInput<ObjectLiteral, DatabaseEventAction.CREATED>;

const buildClient = ({
  executionOrder,
  commitError,
}: {
  executionOrder: string[];
  commitError?: Error;
}) => ({
  query: jest.fn().mockImplementation(async (statement: string) => {
    executionOrder.push(statement);

    if (statement === 'COMMIT' && commitError) {
      throw commitError;
    }

    return { rows: [] };
  }),
  release: jest.fn(),
});

const buildDataSource = ({
  executionOrder,
  commitError,
}: {
  executionOrder: string[];
  commitError?: Error;
}) => {
  const client = buildClient({ executionOrder, commitError });
  const pool = {
    connect: jest.fn().mockResolvedValue(client as unknown as PoolClient),
  } as unknown as Pool;
  const emitDatabaseBatchEvent = jest
    .fn()
    .mockImplementation(
      (event: DatabaseBatchEventInput<ObjectLiteral, DatabaseEventAction>) => {
        executionOrder.push(`database:${event.objectMetadataNameSingular}`);
      },
    );
  const internalContext = {
    workspaceId: WORKSPACE_ID,
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [OBJECT_METADATA_UNIVERSAL_IDENTIFIER]: flatObjectMetadata,
      },
      universalIdentifierById: {
        [OBJECT_METADATA_ID]: OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
      },
      universalIdentifiersByApplicationId: {},
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
    objectIdByNameSingular: { [OBJECT_NAME]: OBJECT_METADATA_ID },
    eventEmitterService: {
      emitDatabaseBatchEvent,
    },
  } as unknown as WorkspaceInternalContext;

  return {
    client,
    dataSource: new WorkspaceDataSource({
      pool,
      internalContext,
      authContext: {
        workspace: { id: WORKSPACE_ID },
      } as WorkspaceAuthContext,
      objectPermissionsByRoleId: {},
    }),
    emitDatabaseBatchEvent,
  };
};

describe('WorkspaceDataSource transactions', () => {
  it('runs after-commit work in registration order only after commit', async () => {
    const executionOrder: string[] = [];
    const { dataSource, emitDatabaseBatchEvent } = buildDataSource({
      executionOrder,
    });

    const result = await dataSource.transaction(async (transactionScope) => {
      const eventEmitterService = transactionScope
        .getRepository(OBJECT_NAME)
        .getInternalContext().eventEmitterService;

      eventEmitterService.emitDatabaseBatchEvent(buildDatabaseEvent('first'));
      transactionScope.afterCommit(() => {
        executionOrder.push('callback');
      });
      eventEmitterService.emitDatabaseBatchEvent(buildDatabaseEvent('last'));

      expect(emitDatabaseBatchEvent).not.toHaveBeenCalled();
      executionOrder.push('work');

      return 'result';
    });

    expect(result).toBe('result');
    expect(executionOrder).toEqual([
      'BEGIN',
      'work',
      'COMMIT',
      'database:first',
      'callback',
      'database:last',
    ]);
  });

  it('logs event errors without rejecting an already committed transaction', async () => {
    const executionOrder: string[] = [];
    const { dataSource, emitDatabaseBatchEvent } = buildDataSource({
      executionOrder,
    });
    const eventError = new Error('event emission failed');
    const loggerError = jest
      .spyOn(dataSource['logger'], 'error')
      .mockImplementation();
    emitDatabaseBatchEvent
      .mockImplementationOnce(() => {
        executionOrder.push('database:failed');

        throw eventError;
      })
      .mockImplementationOnce(
        (
          event: DatabaseBatchEventInput<ObjectLiteral, DatabaseEventAction>,
        ) => {
          executionOrder.push(`database:${event.objectMetadataNameSingular}`);
        },
      );

    await expect(
      dataSource.transaction(async (transactionScope) => {
        const eventEmitterService = transactionScope
          .getRepository(OBJECT_NAME)
          .getInternalContext().eventEmitterService;

        eventEmitterService.emitDatabaseBatchEvent(
          buildDatabaseEvent('failed'),
        );
        eventEmitterService.emitDatabaseBatchEvent(
          buildDatabaseEvent('after-error'),
        );

        return 'result';
      }),
    ).resolves.toBe('result');

    expect(emitDatabaseBatchEvent).toHaveBeenCalledTimes(2);
    expect(loggerError).toHaveBeenCalledWith(
      `Failed to emit deferred database event for workspace ${WORKSPACE_ID}`,
      eventError,
    );
    expect(executionOrder).toEqual([
      'BEGIN',
      'COMMIT',
      'database:failed',
      'database:after-error',
    ]);
  });

  it('logs callback errors without rejecting an already committed transaction', async () => {
    const executionOrder: string[] = [];
    const { dataSource } = buildDataSource({ executionOrder });
    const callbackError = new Error('callback failed');
    const additionalCallbackError = new Error('additional callback failed');
    const loggerError = jest
      .spyOn(dataSource['logger'], 'error')
      .mockImplementation();

    await expect(
      dataSource.transaction(async (transactionScope) => {
        transactionScope.afterCommit(() => {
          executionOrder.push('callback');

          throw callbackError;
        });
        transactionScope.afterCommit(() => {
          executionOrder.push('callback-after-error');

          throw additionalCallbackError;
        });
        transactionScope.afterCommit(() => {
          executionOrder.push('last-callback');
        });
        return 'result';
      }),
    ).resolves.toBe('result');

    expect(loggerError).toHaveBeenNthCalledWith(
      1,
      `After-commit callback failed for workspace ${WORKSPACE_ID}`,
      callbackError,
    );
    expect(loggerError).toHaveBeenNthCalledWith(
      2,
      `After-commit callback failed for workspace ${WORKSPACE_ID}`,
      additionalCallbackError,
    );
    expect(executionOrder).toEqual([
      'BEGIN',
      'COMMIT',
      'callback',
      'callback-after-error',
      'last-callback',
    ]);
  });

  it('discards deferred events when work rolls back', async () => {
    const executionOrder: string[] = [];
    const { dataSource, emitDatabaseBatchEvent } = buildDataSource({
      executionOrder,
    });
    const workError = new Error('work failed');

    await expect(
      dataSource.transaction(async (transactionScope) => {
        transactionScope
          .getRepository(OBJECT_NAME)
          .getInternalContext()
          .eventEmitterService.emitDatabaseBatchEvent(
            buildDatabaseEvent('rolled-back'),
          );
        transactionScope.afterCommit(() => {
          executionOrder.push('callback');
        });

        throw workError;
      }),
    ).rejects.toBe(workError);

    expect(emitDatabaseBatchEvent).not.toHaveBeenCalled();
    expect(executionOrder).toEqual(['BEGIN', 'ROLLBACK']);
  });

  it('discards deferred events when commit fails', async () => {
    const executionOrder: string[] = [];
    const commitError = new Error('commit failed');
    const { dataSource, emitDatabaseBatchEvent } = buildDataSource({
      executionOrder,
      commitError,
    });

    await expect(
      dataSource.transaction(async (transactionScope) => {
        transactionScope
          .getRepository(OBJECT_NAME)
          .getInternalContext()
          .eventEmitterService.emitDatabaseBatchEvent(
            buildDatabaseEvent('not-committed'),
          );
        transactionScope.afterCommit(() => {
          executionOrder.push('callback');
        });
      }),
    ).rejects.toBe(commitError);

    expect(emitDatabaseBatchEvent).not.toHaveBeenCalled();
    expect(executionOrder).toEqual(['BEGIN', 'COMMIT', 'ROLLBACK']);
  });

  it('also defers events for repository-created transactions', async () => {
    const executionOrder: string[] = [];
    const { dataSource, emitDatabaseBatchEvent } = buildDataSource({
      executionOrder,
    });
    const repository = dataSource.getRepository(OBJECT_NAME);

    await repository.runAtomically(async (transactionalRepository) => {
      transactionalRepository
        .getInternalContext()
        .eventEmitterService.emitDatabaseBatchEvent(
          buildDatabaseEvent('repository-transaction'),
        );

      expect(emitDatabaseBatchEvent).not.toHaveBeenCalled();
      executionOrder.push('work');
    });

    expect(executionOrder).toEqual([
      'BEGIN',
      'work',
      'COMMIT',
      'database:repository-transaction',
    ]);
  });

  it('reuses a repository transaction instead of nesting one', async () => {
    const executionOrder: string[] = [];
    const { dataSource } = buildDataSource({ executionOrder });

    await dataSource.transaction(async (transactionScope) => {
      const repository = transactionScope.getRepository(OBJECT_NAME);

      await repository.runAtomically(async (transactionalRepository) => {
        expect(transactionalRepository).toBe(repository);
        executionOrder.push('work');
      });
    });

    expect(executionOrder).toEqual(['BEGIN', 'work', 'COMMIT']);
  });
});
