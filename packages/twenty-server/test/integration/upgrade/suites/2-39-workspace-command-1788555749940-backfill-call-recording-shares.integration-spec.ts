import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { BackfillCallRecordingSharesCommand } from 'src/database/commands/upgrade-version-command/2-39/2-39-workspace-command-1788555749940-backfill-call-recording-shares.command';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { type RecordShare } from 'src/engine/record-share/types/record-share.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';

const authContext = buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID);

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-39 workspace command 1788555749940 - BackfillCallRecordingSharesCommand (integration)', () => {
  let command: BackfillCallRecordingSharesCommand;
  let recordShareService: RecordShareService;
  let workspaceOrmManager: WorkspaceOrmManager;
  let callRecordingObjectMetadataId: string;

  const activeCallRecordingId = randomUUID();
  const deletedCallRecordingId = randomUUID();
  const seededCallRecordingIds = [
    activeCallRecordingId,
    deletedCallRecordingId,
  ];

  const withCallRecordingRepository = <TResult>(
    work: (
      repository: WorkspaceRepository<CallRecordingWorkspaceEntity>,
    ) => Promise<TResult>,
  ): Promise<TResult> =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        work(
          workspaceOrmManager.getRepository<CallRecordingWorkspaceEntity>(
            'callRecording',
            { shouldBypassPermissionChecks: true },
          ),
        ),
      authContext,
    );

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options }),
      authContext,
    );

  const findSeededRecordShares = async (): Promise<RecordShare[]> => {
    const recordSharesPerRecording = await Promise.all(
      seededCallRecordingIds.map((recordId) =>
        recordShareService.findByRecord({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          objectMetadataId: callRecordingObjectMetadataId,
          recordId,
        }),
      ),
    );

    return recordSharesPerRecording.flat();
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<BackfillCallRecordingSharesCommand>(
      'BackfillCallRecordingSharesCommand',
    );
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );

    const callRecordingObjectMetadata =
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'callRecording',
        },
      });

    callRecordingObjectMetadataId = callRecordingObjectMetadata.id;

    await withCallRecordingRepository(async (callRecordingRepository) => {
      await callRecordingRepository.insert([
        { id: activeCallRecordingId, title: 'Backfill share active' },
        { id: deletedCallRecordingId, title: 'Backfill share deleted' },
      ]);
      await callRecordingRepository.softDelete(deletedCallRecordingId);
    });
  });

  afterAll(async () => {
    await withCallRecordingRepository((callRecordingRepository) =>
      callRecordingRepository.delete(seededCallRecordingIds),
    );

    await recordShareService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId: callRecordingObjectMetadataId,
    });
  });

  it('writes nothing on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await findSeededRecordShares()).toHaveLength(0);
  });

  it('gives everyone FULL access to each recording, deleted ones included, exactly once across two runs', async () => {
    await runCommand();
    await runCommand();

    const recordShares = await findSeededRecordShares();

    expect(recordShares).toHaveLength(seededCallRecordingIds.length);
    expect(recordShares.map((recordShare) => recordShare.recordId)).toEqual(
      expect.arrayContaining(seededCallRecordingIds),
    );
    recordShares.forEach((recordShare) => {
      expect(recordShare).toMatchObject({
        objectMetadataId: callRecordingObjectMetadataId,
        principalId: EVERYONE_PRINCIPAL_ID,
        principalType: RecordSharePrincipalType.EVERYONE,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.APPLICATION,
        sourceId: callRecordingObjectMetadataId,
      });
    });
  });
});
