import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type AddRecordShareNoneAccessLevelCommand } from 'src/database/commands/upgrade-version-command/2-45/2-45-workspace-command-1790849715187-add-record-share-none-access-level.command';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type UpgradeCommandRegistryService } from 'src/engine/core-modules/upgrade/services/upgrade-command-registry.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const workspaceId = SEED_APPLE_WORKSPACE_ID;
const authContext = buildSystemAuthContext(workspaceId);
const RECORD_ID = randomUUID();
const OBJECT_METADATA_ID = randomUUID();

describe('2-45 workspace command 1790849715187 - AddRecordShareNoneAccessLevelCommand (integration)', () => {
  let command: AddRecordShareNoneAccessLevelCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let shares: RecordShareStorageService;

  const run = (
    direction: 'up' | 'down',
    { dryRun = false }: { dryRun?: boolean } = {},
  ) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        command[direction]({
          workspaceId,
          options: { dryRun },
          index: 0,
          total: 1,
        }),
      authContext,
    );

  const findAccessLevelValues = async () => {
    const { options } = await getCoreRepository<FieldMetadataEntity>(
      FieldMetadataEntity,
    ).findOneOrFail({
      where: {
        universalIdentifier:
          STANDARD_OBJECTS.recordShare.fields.accessLevel.universalIdentifier,
        workspaceId,
      },
    });

    return ((options ?? []) as FieldMetadataComplexOption[]).map(
      ({ value }) => value,
    );
  };

  const insertRestriction = () =>
    shares.insertMany({
      workspaceId,
      recordShares: [
        {
          objectMetadataId: OBJECT_METADATA_ID,
          recordId: RECORD_ID,
          principalId: EVERYONE_PRINCIPAL_ID,
          principalType: RecordSharePrincipalType.EVERYONE,
          accessLevel: RecordShareAccessLevel.NONE,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: RECORD_ID,
        },
      ],
    });

  const findRestrictions = () =>
    shares.findByRecordIds({
      workspaceId,
      objectMetadataId: OBJECT_METADATA_ID,
      recordIds: [RECORD_ID],
    });

  beforeAll(() => {
    command = getAppProviderByClassName<AddRecordShareNoneAccessLevelCommand>(
      'AddRecordShareNoneAccessLevelCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    shares = getAppProviderByClassName<RecordShareStorageService>(
      'RecordShareStorageService',
    );
  });

  afterAll(async () => {
    await run('up');
    await shares.deleteByRecordIds({
      workspaceId,
      objectMetadataId: OBJECT_METADATA_ID,
      recordIds: [RECORD_ID],
    });
  });

  it('is registered in the 2.45 bundle', () => {
    const registry = getAppProviderByClassName<UpgradeCommandRegistryService>(
      'UpgradeCommandRegistryService',
    );

    expect(registry.getBundleForVersion('2.45.0').workspaceCommands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ command, timestamp: 1790849715187 }),
      ]),
    );
  });

  it('removes restrictions and the option on the way down', async () => {
    await insertRestriction();

    await run('down');

    expect(await findAccessLevelValues()).not.toContain(
      RecordShareAccessLevel.NONE,
    );
    expect(await findRestrictions()).toEqual([]);
    await expect(insertRestriction()).rejects.toThrow();
  });

  it('keeps a workspace without the option untouched on a dry run', async () => {
    await run('up', { dryRun: true });

    expect(await findAccessLevelValues()).not.toContain(
      RecordShareAccessLevel.NONE,
    );
  });

  it('adds the option so restrictions can be stored, once', async () => {
    await run('up');
    await run('up');

    const values = await findAccessLevelValues();

    expect(
      values.filter((value) => value === RecordShareAccessLevel.NONE),
    ).toHaveLength(1);
    await insertRestriction();
    expect(await findRestrictions()).toEqual([
      expect.objectContaining({ accessLevel: RecordShareAccessLevel.NONE }),
    ]);
  });
});
