import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type MergeAiChatInboxFeatureFlagsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791822328094-merge-ai-chat-inbox-feature-flags.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const COMPANY_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.companyRecordPage.tabs
    .conversations.widgets.conversations.universalIdentifier;

const PERSON_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.conversations
    .widgets.conversations.universalIdentifier;

const setFlag = (key: string, value: boolean) =>
  global.testDataSource.query(
    `INSERT INTO core."featureFlag" ("workspaceId", key, value)
     VALUES ($1, $2, $3)
     ON CONFLICT ("key", "workspaceId") DO UPDATE SET value = $3`,
    [SEED_APPLE_WORKSPACE_ID, key, value],
  );

const readFlags = async (): Promise<Record<string, boolean>> => {
  const rows: { key: string; value: boolean }[] =
    await global.testDataSource.query(
      `SELECT key, value FROM core."featureFlag"
       WHERE "workspaceId" = $1 AND key = ANY($2::text[])`,
      [
        SEED_APPLE_WORKSPACE_ID,
        [
          'IS_AI_CHAT_INBOX_ENABLED',
          'IS_CONVERSATIONS_TAB_ENABLED',
          'IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED',
        ],
      ],
    );

  return Object.fromEntries(rows.map(({ key, value }) => [key, value]));
};

const readWidgetExpression = async (
  universalIdentifier: string,
): Promise<string | null> => {
  const [widget]: { conditionalAvailabilityExpression: string | null }[] =
    await global.testDataSource.query(
      `SELECT "conditionalAvailabilityExpression" FROM core."pageLayoutWidget"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [SEED_APPLE_WORKSPACE_ID, universalIdentifier],
    );

  return widget.conditionalAvailabilityExpression;
};

describe('2-47 workspace command - merge AI chat inbox feature flags (integration)', () => {
  let command: MergeAiChatInboxFeatureFlagsCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const setWidgetExpression = async (
    universalIdentifier: string,
    expression: string,
  ) => {
    await global.testDataSource.query(
      `UPDATE core."pageLayoutWidget" SET "conditionalAvailabilityExpression" = $3
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [SEED_APPLE_WORKSPACE_ID, universalIdentifier, expression],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatPageLayoutWidgetMaps'],
    );
  };

  beforeAll(() => {
    command = getAppProviderByClassName<MergeAiChatInboxFeatureFlagsCommand>(
      'MergeAiChatInboxFeatureFlagsCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await setFlag('IS_AI_CHAT_INBOX_ENABLED', true);
    await setWidgetExpression(
      PERSON_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER,
      'featureFlags.IS_AI_CHAT_INBOX_ENABLED',
    );
  });

  it('turns the inbox on for a workspace that had one of the merged flags, and drops them', async () => {
    await setFlag('IS_AI_CHAT_INBOX_ENABLED', false);
    await setFlag('IS_CONVERSATIONS_TAB_ENABLED', true);
    await setFlag('IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED', false);

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readFlags()).toEqual({ IS_AI_CHAT_INBOX_ENABLED: true });
  });

  it('leaves the inbox off when none of the merged flags was on', async () => {
    await setFlag('IS_AI_CHAT_INBOX_ENABLED', false);
    await setFlag('IS_CONVERSATIONS_TAB_ENABLED', false);

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readFlags()).toEqual({ IS_AI_CHAT_INBOX_ENABLED: false });
  });

  it('moves the Conversations widgets and brings the merged flags back with the inbox value on down', async () => {
    await setFlag('IS_AI_CHAT_INBOX_ENABLED', true);

    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await readFlags()).toEqual({
      IS_AI_CHAT_INBOX_ENABLED: true,
      IS_CONVERSATIONS_TAB_ENABLED: true,
      IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED: true,
    });
    expect(
      await readWidgetExpression(
        COMPANY_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER,
      ),
    ).toBe('featureFlags.IS_CONVERSATIONS_TAB_ENABLED');

    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await readFlags()).toEqual({ IS_AI_CHAT_INBOX_ENABLED: true });
    expect(
      await readWidgetExpression(
        COMPANY_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER,
      ),
    ).toBe('featureFlags.IS_AI_CHAT_INBOX_ENABLED');
  });

  it('keeps a Conversations widget expression the workspace changed', async () => {
    await setWidgetExpression(
      PERSON_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER,
      'false',
    );

    await command.down(RUN_ON_WORKSPACE_ARGS);
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(
      await readWidgetExpression(
        PERSON_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER,
      ),
    ).toBe('false');
  });
});
