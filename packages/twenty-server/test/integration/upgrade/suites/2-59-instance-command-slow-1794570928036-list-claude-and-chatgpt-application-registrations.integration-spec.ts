import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { v4 } from 'uuid';

import { ListClaudeAndChatgptApplicationRegistrationsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-59/2-59-instance-command-slow-1794570928036-list-claude-and-chatgpt-application-registrations';
import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';

jest.useRealTimers();

const CLAUDE_UNIVERSAL_IDENTIFIER = '20202020-b759-4b27-9593-4d075aea79ed';
const CHATGPT_UNIVERSAL_IDENTIFIER = '20202020-2cef-4d6c-9c88-05b40177ce9e';

describe('2-59 slow instance command 1794570928036 - ListClaudeAndChatgptApplicationRegistrationsSlowInstanceCommand (integration)', () => {
  const insertedRegistrationIds: string[] = [];

  const insertUnlistedRegistration = async ({
    universalIdentifier,
    sourcePackage,
  }: {
    universalIdentifier: string;
    sourcePackage: string;
  }): Promise<string> => {
    const [{ id }] = await global.testDataSource.query(
      `INSERT INTO "core"."applicationRegistration"
         ("universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris",
          "oAuthScopes", "sourceType", "sourcePackage", "isListed")
       VALUES ($1, 'Catalog app synchronized before the rollout', $2, $3, $4, 'npm', $5, false)
       RETURNING id`,
      [universalIdentifier, v4(), [], [], sourcePackage],
    );

    insertedRegistrationIds.push(id);

    return id;
  };

  const readIsListed = async (registrationId: string): Promise<boolean> => {
    const [{ isListed }] = await global.testDataSource.query(
      `SELECT "isListed" FROM "core"."applicationRegistration" WHERE id = $1`,
      [registrationId],
    );

    return isListed;
  };

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM "core"."applicationRegistration" WHERE id = ANY($1)`,
      [insertedRegistrationIds],
    );
  });

  it('should list the official package synchronized before it was featured and leave another package unlisted', async () => {
    const claudeRegistrationId = await insertUnlistedRegistration({
      universalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER,
      sourcePackage: '@twentyhq/claude',
    });
    const otherPackageRegistrationId = await insertUnlistedRegistration({
      universalIdentifier: CHATGPT_UNIVERSAL_IDENTIFIER,
      sourcePackage: '@someone-else/chatgpt',
    });
    const unrelatedRegistrationId = await insertUnlistedRegistration({
      universalIdentifier: v4(),
      sourcePackage: '@twentyhq/unrelated',
    });

    await new ListClaudeAndChatgptApplicationRegistrationsSlowInstanceCommand(
      getAppProviderByClassName<CoreEntityCacheService>(
        'CoreEntityCacheService',
      ),
    ).runDataMigration(global.testDataSource);

    expect(await readIsListed(claudeRegistrationId)).toBe(true);
    expect(await readIsListed(otherPackageRegistrationId)).toBe(false);
    expect(await readIsListed(unrelatedRegistrationId)).toBe(false);
  });
});
