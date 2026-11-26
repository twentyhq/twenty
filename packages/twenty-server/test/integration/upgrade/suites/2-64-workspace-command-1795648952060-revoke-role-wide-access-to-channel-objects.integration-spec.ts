import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { grantRoleWideAccessToChannelObjects } from 'test/integration/utils/role-wide-access-to-channel-objects.util';

import { type RevokeRoleWideAccessToChannelObjectsUpgradeCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795648952060-revoke-role-wide-access-to-channel-objects.command';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const readMemberRoleChannelAccess = async () => {
  const [row]: {
    unreadableObjectUniversalIdentifiers: string[];
    ruleObjectUniversalIdentifiers: string[];
  }[] = await global.testDataSource.query(
    `SELECT
       COALESCE(ARRAY(
         SELECT "object"."universalIdentifier"::text
         FROM core."objectPermission" "objectPermission"
         JOIN core."objectMetadata" "object" ON "object".id = "objectPermission"."objectMetadataId"
         WHERE "objectPermission"."roleId" = "role".id
           AND "objectPermission"."canReadObjectRecords" = false
         ORDER BY 1
       ), '{}') AS "unreadableObjectUniversalIdentifiers",
       COALESCE(ARRAY(
         SELECT DISTINCT "object"."universalIdentifier"::text
         FROM core."rowLevelPermissionPredicateGroup" "group"
         JOIN core."objectMetadata" "object" ON "object".id = "group"."objectMetadataId"
         WHERE "group"."roleId" = "role".id AND "group"."deletedAt" IS NULL
         ORDER BY 1
       ), '{}') AS "ruleObjectUniversalIdentifiers"
     FROM core."role" "role"
     WHERE "role"."workspaceId" = $1 AND "role"."label" = 'Member'`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return row;
};

describe('2-64 workspace command - revoke role wide access to channel objects (integration)', () => {
  let command: RevokeRoleWideAccessToChannelObjectsUpgradeCommand;

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
    });

  beforeAll(async () => {
    command =
      getAppProviderByClassName<RevokeRoleWideAccessToChannelObjectsUpgradeCommand>(
        'RevokeRoleWideAccessToChannelObjectsUpgradeCommand',
      );

    await grantRoleWideAccessToChannelObjects();
  });

  it('leaves the role wide access in place on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await readMemberRoleChannelAccess()).toEqual({
      unreadableObjectUniversalIdentifiers: [],
      ruleObjectUniversalIdentifiers: [],
    });
  });

  it('revokes the role wide access and keeps the attachments and call recordings of other records readable', async () => {
    await runCommand();

    const {
      unreadableObjectUniversalIdentifiers,
      ruleObjectUniversalIdentifiers,
    } = await readMemberRoleChannelAccess();

    expect(unreadableObjectUniversalIdentifiers).toEqual(
      expect.arrayContaining([
        STANDARD_OBJECTS.message.universalIdentifier,
        STANDARD_OBJECTS.messageThread.universalIdentifier,
        STANDARD_OBJECTS.calendarEvent.universalIdentifier,
        STANDARD_OBJECTS.attachment.universalIdentifier,
        STANDARD_OBJECTS.callRecording.universalIdentifier,
      ]),
    );
    expect([...ruleObjectUniversalIdentifiers].sort()).toEqual(
      [
        STANDARD_OBJECTS.attachment.universalIdentifier,
        STANDARD_OBJECTS.callRecording.universalIdentifier,
      ].sort(),
    );
  });

  it('is a no-op when run again', async () => {
    const accessBefore = await readMemberRoleChannelAccess();

    await runCommand();

    expect(await readMemberRoleChannelAccess()).toEqual(accessBefore);
  });
});
