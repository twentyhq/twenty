import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MakeRestrictedRecordsPrivateCommand } from 'src/database/commands/upgrade-version-command/2-55/2-55-workspace-command-1793457458179-make-restricted-records-private.command';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('2-55 workspace command - make restricted records private (integration)', () => {
  let command: MakeRestrictedRecordsPrivateCommand;
  let personObjectMetadataId: string;
  let restrictedPersonId: string;
  let viewOnlyPersonId: string;

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const insertEveryoneShare = ({
    recordId,
    accessLevel,
  }: {
    recordId: string;
    accessLevel: string;
  }) =>
    global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."recordShare"
         ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
       VALUES ($1, $2, $3, 'EVERYONE', $4, 'MANUAL', $2)`,
      [personObjectMetadataId, recordId, EVERYONE_PRINCIPAL_ID, accessLevel],
    );

  const findPrivatePersonIds = async (): Promise<string[]> =>
    (
      await global.testDataSource.query(
        `SELECT id FROM "${SCHEMA}"."person" WHERE "_isPrivate" AND id = ANY($1)`,
        [[restrictedPersonId, viewOnlyPersonId]],
      )
    ).map(({ id }: { id: string }) => id);

  const countEveryoneShares = async (): Promise<number> => {
    const [{ count }] = await global.testDataSource.query(
      `SELECT COUNT(*) AS count FROM "${SCHEMA}"."recordShare"
         WHERE "objectMetadataId" = $1 AND "principalType" = 'EVERYONE' AND "recordId" = ANY($2)`,
      [personObjectMetadataId, [restrictedPersonId, viewOnlyPersonId]],
    );

    return Number(count);
  };

  const setPrivateRecordFlag = async (value: boolean | undefined) => {
    if (value === undefined) {
      await global.testDataSource.query(
        `DELETE FROM core."featureFlag" WHERE "workspaceId" = $1 AND key = $2`,
        [SEED_APPLE_WORKSPACE_ID, FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED],
      );

      return;
    }

    await global.testDataSource.query(
      `INSERT INTO core."featureFlag" ("workspaceId", key, value) VALUES ($1, $2, $3)
         ON CONFLICT ("workspaceId", key) DO UPDATE SET value = $3`,
      [
        SEED_APPLE_WORKSPACE_ID,
        FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED,
        value,
      ],
    );
  };

  const findPrivateRecordFlag = async (): Promise<boolean | undefined> => {
    const [flag] = await global.testDataSource.query(
      `SELECT value FROM core."featureFlag" WHERE "workspaceId" = $1 AND key = $2`,
      [SEED_APPLE_WORKSPACE_ID, FeatureFlagKey.IS_PRIVATE_RECORD_ENABLED],
    );

    return flag?.value;
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<MakeRestrictedRecordsPrivateCommand>(
      'MakeRestrictedRecordsPrivateCommand',
    );

    [{ id: personObjectMetadataId }] = await global.testDataSource.query(
      `SELECT id FROM core."objectMetadata" WHERE "workspaceId" = $1 AND "nameSingular" = 'person'`,
      [SEED_APPLE_WORKSPACE_ID],
    );
    restrictedPersonId = randomUUID();
    viewOnlyPersonId = randomUUID();
    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."person" (id) VALUES ($1), ($2)`,
      [restrictedPersonId, viewOnlyPersonId],
    );
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."recordShare" WHERE "recordId" = ANY($1)`,
      [[restrictedPersonId, viewOnlyPersonId]],
    );
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."person" WHERE id = ANY($1)`,
      [[restrictedPersonId, viewOnlyPersonId]],
    );
    await setPrivateRecordFlag(true);
  });

  it('changes nothing on a dry run', async () => {
    await setPrivateRecordFlag(undefined);
    await insertEveryoneShare({
      recordId: restrictedPersonId,
      accessLevel: 'NONE',
    });
    await insertEveryoneShare({
      recordId: viewOnlyPersonId,
      accessLevel: 'READ',
    });

    await runOnWorkspace({ dryRun: true });

    expect(await findPrivatePersonIds()).toEqual([]);
    expect(await countEveryoneShares()).toBe(2);
    expect(await findPrivateRecordFlag()).toBeUndefined();
  });

  it('makes restricted records private, drops view-only restrictions and enables private records', async () => {
    await runOnWorkspace();

    expect(await findPrivatePersonIds()).toEqual([restrictedPersonId]);
    expect(await countEveryoneShares()).toBe(0);
    expect(await findPrivateRecordFlag()).toBe(true);
  });

  it('is idempotent and turns a disabled flag back on', async () => {
    await setPrivateRecordFlag(false);

    await runOnWorkspace();

    expect(await findPrivatePersonIds()).toEqual([restrictedPersonId]);
    expect(await findPrivateRecordFlag()).toBe(true);
  });
});
