import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type RenameEmailsTabToMessagesCommand } from 'src/database/commands/upgrade-version-command/2-56/2-56-workspace-command-1793707166734-rename-emails-tab-to-messages.command';
import { MESSAGES_TAB_MIGRATION_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-56/constants/messages-tab-migration-universal-identifiers.constant';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const EMAILS_TITLE = 'Emails';
const EMAILS_ICON = 'IconMail';
const MESSAGES_TITLE = 'Messages';
const MESSAGES_ICON = 'IconMessage';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('2-56 workspace command - rename Emails tab to Messages (integration)', () => {
  let command: RenameEmailsTabToMessagesCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService;

  const findMessagesTabsAndWidgets = async () => {
    const { flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    return {
      tabs: MESSAGES_TAB_MIGRATION_UNIVERSAL_IDENTIFIERS.tabs
        .map(
          (universalIdentifier) =>
            flatPageLayoutTabMaps.byUniversalIdentifier[universalIdentifier],
        )
        .filter(isDefined),
      widgets: MESSAGES_TAB_MIGRATION_UNIVERSAL_IDENTIFIERS.widgets
        .map(
          (universalIdentifier) =>
            flatPageLayoutWidgetMaps.byUniversalIdentifier[universalIdentifier],
        )
        .filter(isDefined),
    };
  };

  const updateTabsAndWidgets = async ({
    tabs,
    widgets,
  }: {
    tabs: FlatPageLayoutTab[];
    widgets: FlatPageLayoutWidget[];
  }) => {
    const result =
      await workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: tabs,
            },
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: widgets,
            },
          },
        },
      );

    expect(result.status).toBe('success');
  };

  const resetToEmailsTabs = async ({
    firstTabTitle = EMAILS_TITLE,
  }: { firstTabTitle?: string } = {}) => {
    const { tabs, widgets } = await findMessagesTabsAndWidgets();

    await updateTabsAndWidgets({
      tabs: tabs.map((tab, index) => ({
        ...tab,
        title: index === 0 ? firstTabTitle : EMAILS_TITLE,
        icon: EMAILS_ICON,
      })),
      widgets: widgets.map((widget) => ({
        ...widget,
        title: EMAILS_TITLE,
      })),
    });
  };

  beforeAll(() => {
    command = getAppProviderByClassName<RenameEmailsTabToMessagesCommand>(
      'RenameEmailsTabToMessagesCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    workspaceMigrationValidateBuildAndRunService =
      getAppProviderByClassName<WorkspaceMigrationValidateBuildAndRunService>(
        'WorkspaceMigrationValidateBuildAndRunService',
      );
  });

  afterAll(async () => {
    await resetToEmailsTabs();
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);
  });

  it('leaves the Emails tabs unchanged on a dry run', async () => {
    await resetToEmailsTabs();

    await command.runOnWorkspace({
      ...RUN_ON_WORKSPACE_ARGS,
      options: { dryRun: true },
    });

    const { tabs, widgets } = await findMessagesTabsAndWidgets();

    expect(tabs).toHaveLength(3);
    expect(widgets).toHaveLength(3);
    for (const tab of tabs) {
      expect(tab).toMatchObject({ title: EMAILS_TITLE, icon: EMAILS_ICON });
    }

    for (const widget of widgets) {
      expect(widget.title).toBe(EMAILS_TITLE);
    }
  });

  it('renames the Emails tabs and widgets to Messages', async () => {
    await resetToEmailsTabs();

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const { tabs, widgets } = await findMessagesTabsAndWidgets();

    expect(tabs).toHaveLength(3);
    expect(widgets).toHaveLength(3);

    for (const tab of tabs) {
      expect(tab).toMatchObject({ title: MESSAGES_TITLE, icon: MESSAGES_ICON });
    }

    for (const widget of widgets) {
      expect(widget.title).toBe(MESSAGES_TITLE);
    }
  });

  it('keeps a customized tab title and only switches its icon', async () => {
    await resetToEmailsTabs({ firstTabTitle: 'Inbox' });

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const { tabs } = await findMessagesTabsAndWidgets();
    const [customizedTab, ...otherTabs] = tabs;

    expect(tabs).toHaveLength(3);
    expect(customizedTab).toMatchObject({
      title: 'Inbox',
      icon: MESSAGES_ICON,
    });
    for (const tab of otherTabs) {
      expect(tab.title).toBe(MESSAGES_TITLE);
    }
  });

  it('is a no-op once the workspace is migrated', async () => {
    await resetToEmailsTabs();
    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    const before = await findMessagesTabsAndWidgets();

    expect(before.tabs).toHaveLength(3);

    for (const tab of before.tabs) {
      expect(tab.title).toBe(MESSAGES_TITLE);
    }

    await command.runOnWorkspace(RUN_ON_WORKSPACE_ARGS);

    expect(await findMessagesTabsAndWidgets()).toEqual(before);
  });
});
