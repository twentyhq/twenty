import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
/* @license Enterprise */

import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

describe('recordShare object', () => {
  let recordShareStorageService: RecordShareStorageService;
  let personObjectMetadataId: string;
  let recordShareInput: RecordShareInput;

  const sourceId = randomUUID();

  beforeAll(async () => {
    recordShareStorageService =
      getAppProviderByClassName<RecordShareStorageService>(
        'RecordShareStorageService',
      );

    const personObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: 'person',
      },
    });

    personObjectMetadataId = personObjectMetadata.id;

    recordShareInput = {
      recordId: PERSON_DATA_SEED_IDS.ID_1,
      objectMetadataId: personObjectMetadataId,
      principalId: randomUUID(),
      principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
      accessLevel: RecordShareAccessLevel.READ,
      rowCause: RecordShareRowCause.MANUAL,
      sourceId,
    };
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value: false,
      expectToFail: false,
    });
    await recordShareStorageService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });
  });

  it('serializes concurrent replacements and preserves other grant sources', async () => {
    const recordId = randomUUID();
    const share = { ...recordShareInput, recordId, sourceId: recordId };
    const workspaceId = SEED_APPLE_WORKSPACE_ID;
    await recordShareStorageService.insertMany({
      workspaceId,
      recordShares: [
        { ...share, rowCause: RecordShareRowCause.OWNER },
        { ...share, rowCause: RecordShareRowCause.APPLICATION },
      ],
    });
    const readShares = () =>
      recordShareStorageService.findByRecordIds({
        workspaceId,
        objectMetadataId: personObjectMetadataId,
        recordIds: [recordId],
      });
    try {
      await Promise.all(
        Array.from({ length: 8 }, () =>
          setManualRecordShare({
            workspaceId,
            share,
            enabled: true,
          }),
        ),
      );
      expect(await readShares()).toHaveLength(3);
      const manager = getAppProviderByClassName<WorkspaceOrmManager>(
        'WorkspaceOrmManager',
      );
      const runTransaction = manager.runInWorkspaceTransaction.bind(manager);
      const transactionSpy = jest
        .spyOn(manager, 'runInWorkspaceTransaction')
        .mockImplementationOnce(
          <TResult>(
            work: (scope: WorkspaceTransactionScope) => Promise<TResult>,
          ): Promise<TResult> =>
            runTransaction(async (scope: WorkspaceTransactionScope) => {
              await work(scope);
              throw new Error('Abort grant transaction');
            }),
        );
      try {
        await expect(
          setManualRecordShare({
            workspaceId,
            share,
            enabled: false,
          }),
        ).rejects.toThrow('Abort grant transaction');
      } finally {
        transactionSpy.mockRestore();
      }
      expect(await readShares()).toHaveLength(3);
      await setManualRecordShare({
        workspaceId,
        share: { ...share, sourceId: randomUUID() },
        enabled: false,
      });
      expect(await readShares()).toHaveLength(2);
      await setManualRecordShare({
        workspaceId,
        share,
        enabled: false,
      });
      expect(
        (await readShares()).map(({ rowCause }) => rowCause).sort(),
      ).toEqual(
        [RecordShareRowCause.OWNER, RecordShareRowCause.APPLICATION].sort(),
      );
    } finally {
      await recordShareStorageService.deleteByRecordIds({
        workspaceId,
        objectMetadataId: personObjectMetadataId,
        recordIds: [recordId],
      });
    }
  });

  it('rolls back thread deletion if grant cleanup fails, then deletes both together', async () => {
    const chatService =
      getAppProviderByClassName<AgentChatService>('AgentChatService');
    const sharingService = getAppProviderByClassName<AgentChatSharingService>(
      'AgentChatSharingService',
    );
    const metadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: 'agentChatThread',
      },
    });
    const args = {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      threadId: randomUUID(),
    };
    await chatService.createThread({
      ...args,
      id: args.threadId,
      title: 'Sharing transaction test',
    });
    await setManualRecordShare({
      workspaceId: args.workspaceId,
      enabled: true,
      share: {
        ...recordShareInput,
        objectMetadataId: metadata.id,
        recordId: args.threadId,
        sourceId: args.threadId,
      },
    });
    const repository = sharingService['threadRepository'];
    const originalQuery = repository.query.bind(repository);
    const querySpy = jest.spyOn(repository, 'query').mockImplementation(
      <TResult>(
        workspaceId: string,
        work: (context: AgentHistoryStorageContext) => Promise<TResult>,
      ): Promise<TResult> =>
        originalQuery(
          workspaceId,
          async (context: AgentHistoryStorageContext) => {
            const originalManagerQuery = context.manager.query.bind(
              context.manager,
            );
            jest
              .spyOn(context.manager, 'query')
              .mockImplementationOnce(originalManagerQuery)
              .mockRejectedValueOnce(new Error('grant cleanup failed'));
            return work(context);
          },
        ),
    );
    try {
      await expect(sharingService.deleteThreadWithShares(args)).rejects.toThrow(
        'grant cleanup failed',
      );
      querySpy.mockRestore();
      await expect(chatService.findWritableThread(args)).resolves.toMatchObject(
        {
          id: args.threadId,
        },
      );
      await expect(
        recordShareStorageService.findByRecordIds({
          workspaceId: args.workspaceId,
          objectMetadataId: metadata.id,
          recordIds: [args.threadId],
        }),
      ).resolves.toHaveLength(2);
      await chatService.hardDeleteThread(args);
      await expect(chatService.findWritableThread(args)).resolves.toBeNull();
      await expect(
        recordShareStorageService.findByRecordIds({
          workspaceId: args.workspaceId,
          objectMetadataId: metadata.id,
          recordIds: [args.threadId],
        }),
      ).resolves.toEqual([]);
    } finally {
      querySpy.mockRestore();
      if (await chatService.findWritableThread(args)) {
        await sharingService.deleteThreadWithShares(args);
      }
    }
  });

  it.each([false, true])(
    'refuses reads through the GraphQL API even for an admin when record sharing is %s',
    async (isRecordSharingEnabled) => {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
        value: isRecordSharingEnabled,
        expectToFail: false,
      });

      const response = await makeGraphqlAPIRequest(
        findManyOperationFactory({
          objectMetadataSingularName: 'recordShare',
          objectMetadataPluralName: 'recordShares',
          gqlFields: 'id',
        }),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not readable');
    },
  );

  it('refuses creation through the GraphQL API even for an admin', async () => {
    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'recordShare',
        gqlFields: 'id',
        data: recordShareInput,
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toContain('not writable');
  });

  it('inserts, reads back, deduplicates and removes shares through the service', async () => {
    await recordShareStorageService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [recordShareInput],
    });

    const insertedRecordShares =
      await recordShareStorageService.findByRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: personObjectMetadataId,
        recordIds: [PERSON_DATA_SEED_IDS.ID_1],
      });

    expect(insertedRecordShares).toHaveLength(1);
    expect(insertedRecordShares[0]).toMatchObject(recordShareInput);

    await recordShareStorageService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        { ...recordShareInput, accessLevel: RecordShareAccessLevel.FULL },
      ],
    });

    const recordSharesAfterDuplicateInsert =
      await recordShareStorageService.findByRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: personObjectMetadataId,
        recordIds: [PERSON_DATA_SEED_IDS.ID_1],
      });

    expect(recordSharesAfterDuplicateInsert).toHaveLength(1);
    expect(recordSharesAfterDuplicateInsert[0].accessLevel).toBe(
      RecordShareAccessLevel.READ,
    );

    await recordShareStorageService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });

    const recordSharesAfterDelete =
      await recordShareStorageService.findByRecordIds({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        objectMetadataId: personObjectMetadataId,
        recordIds: [PERSON_DATA_SEED_IDS.ID_1],
      });

    expect(recordSharesAfterDelete).toHaveLength(0);
  });
});
