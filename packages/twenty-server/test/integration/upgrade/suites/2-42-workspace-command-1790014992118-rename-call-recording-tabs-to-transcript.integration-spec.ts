import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { In } from 'typeorm';

import { type RenameCallRecordingTabsToTranscriptCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790014992118-rename-call-recording-tabs-to-transcript.command';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TRANSCRIPT_TABS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
    .callRecording,
];
const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

describe('RenameCallRecordingTabsToTranscriptCommand (integration)', () => {
  let command: RenameCallRecordingTabsToTranscriptCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;
  let originalTabs: PageLayoutTabEntity[];
  let originalWidgets: PageLayoutWidgetEntity[];
  let workspaceCustomApplicationUniversalIdentifier: string;

  const tabRepository = () =>
    getCoreRepository<PageLayoutTabEntity>(PageLayoutTabEntity);
  const widgetRepository = () =>
    getCoreRepository<PageLayoutWidgetEntity>(PageLayoutWidgetEntity);
  const findTabs = () =>
    tabRepository().find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        universalIdentifier: In(
          TRANSCRIPT_TABS.map((tab) => tab.universalIdentifier),
        ),
      },
      order: { universalIdentifier: 'ASC' },
    });
  const findWidgets = () =>
    widgetRepository().find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        universalIdentifier: In(
          TRANSCRIPT_TABS.map(
            (tab) => tab.widgets.transcript.universalIdentifier,
          ),
        ),
      },
      order: { universalIdentifier: 'ASC' },
    });
  const refreshCache = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);
  const runCommand = (
    options: { dryRun?: boolean } = {},
    direction: 'up' | 'down' = 'up',
  ) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        direction === 'up'
          ? command.runOnWorkspace({ ...RUN_ON_WORKSPACE_ARGS, options })
          : command.down({ ...RUN_ON_WORKSPACE_ARGS, options }),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  beforeAll(async () => {
    command =
      getAppProviderByClassName<RenameCallRecordingTabsToTranscriptCommand>(
        'RenameCallRecordingTabsToTranscriptCommand',
      );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    originalTabs = await findTabs();
    originalWidgets = await findWidgets();
    const workspace = await getCoreRepository<WorkspaceEntity>(
      WorkspaceEntity,
    ).findOneOrFail({
      where: { id: SEED_APPLE_WORKSPACE_ID },
      relations: { workspaceCustomApplication: true },
    });
    workspaceCustomApplicationUniversalIdentifier =
      workspace.workspaceCustomApplication.universalIdentifier;
    expect(originalTabs).toHaveLength(2);
    expect(originalWidgets).toHaveLength(2);
  });

  beforeEach(async () => {
    await tabRepository().update(
      { id: In(originalTabs.map((tab) => tab.id)) },
      { title: 'Call Recording', icon: 'IconVideo', overrides: null },
    );
    await widgetRepository().update(
      { id: In(originalWidgets.map((widget) => widget.id)) },
      { title: 'Call Recording', overrides: null },
    );
    await refreshCache();
  });

  afterAll(async () => {
    for (const tab of originalTabs ?? []) {
      await tabRepository().update(tab.id, {
        title: tab.title,
        icon: tab.icon,
        overrides: tab.overrides,
      });
    }
    for (const widget of originalWidgets ?? []) {
      await widgetRepository().update(widget.id, {
        title: widget.title,
        overrides: widget.overrides,
      });
    }
    if (workspaceCacheService) {
      await refreshCache();
    }
  });

  it('does not write metadata on a dry run', async () => {
    const tabsBefore = await findTabs();
    const widgetsBefore = await findWidgets();

    await runCommand({ dryRun: true });

    expect(await findTabs()).toEqual(tabsBefore);
    expect(await findWidgets()).toEqual(widgetsBefore);
  });

  it('renames both objects in place, refreshes the cache and is idempotent', async () => {
    const tabsBefore = await findTabs();
    const widgetsBefore = await findWidgets();

    await runCommand();

    const tabsAfter = await findTabs();
    const widgetsAfter = await findWidgets();
    expect(tabsAfter).toEqual(
      tabsBefore.map((tab) => ({
        ...tab,
        title: 'Transcript',
        icon: 'IconBlockquote',
        updatedAt: expect.anything(),
      })),
    );
    expect(widgetsAfter).toEqual(
      widgetsBefore.map((widget) => ({
        ...widget,
        title: 'Transcript',
        updatedAt: expect.anything(),
      })),
    );
    const { flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);
    for (const tab of TRANSCRIPT_TABS) {
      expect(
        flatPageLayoutTabMaps.byUniversalIdentifier[tab.universalIdentifier],
      ).toMatchObject({ title: 'Transcript', icon: 'IconBlockquote' });
      expect(
        flatPageLayoutWidgetMaps.byUniversalIdentifier[
          tab.widgets.transcript.universalIdentifier
        ],
      ).toMatchObject({ title: 'Transcript' });
    }

    await runCommand();

    expect(await findTabs()).toEqual(tabsAfter);
    expect(await findWidgets()).toEqual(widgetsAfter);
  });

  it('retains workspace overrides and their effective titles and icon', async () => {
    const tabOverrides = {
      [workspaceCustomApplicationUniversalIdentifier]: {
        title: 'Interview',
        icon: 'IconPhone',
        position: 17,
      },
    };
    const widgetOverrides = {
      [workspaceCustomApplicationUniversalIdentifier]: {
        title: 'Interview notes',
      },
    };
    await tabRepository().update(originalTabs[0].id, {
      overrides: tabOverrides,
    });
    await widgetRepository().update(originalWidgets[0].id, {
      overrides: widgetOverrides,
    });
    await refreshCache();

    await runCommand();

    const tab = (await findTabs())[0];
    const widget = (await findWidgets())[0];
    expect(tab.overrides).toEqual(tabOverrides);
    expect(widget.overrides).toEqual(widgetOverrides);
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'pageLayoutTab',
        overrides: tab.overrides,
        path: ['title'],
        authorContext: {
          ownerApplicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      }),
    ).toBe('Interview');
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'pageLayoutTab',
        overrides: tab.overrides,
        path: ['icon'],
        authorContext: {
          ownerApplicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      }),
    ).toBe('IconPhone');
    expect(
      readAuthoredOverrideProperty({
        metadataName: 'pageLayoutWidget',
        overrides: widget.overrides,
        path: ['title'],
        authorContext: {
          ownerApplicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      }),
    ).toBe('Interview notes');
  });

  it('leaves directly customized titles and icons untouched', async () => {
    await tabRepository().update(originalTabs[0].id, {
      title: 'Interview',
      icon: 'IconPhone',
    });
    await widgetRepository().update(originalWidgets[0].id, {
      title: 'Interview notes',
    });
    await refreshCache();

    await runCommand();

    expect((await findTabs())[0]).toMatchObject({
      title: 'Interview',
      icon: 'IconPhone',
    });
    expect((await findWidgets())[0]).toMatchObject({
      title: 'Interview notes',
    });
  });

  it('restores the previous tab defaults on down and can upgrade again', async () => {
    await runCommand();
    const tabsAfterUp = await findTabs();

    await runCommand({ dryRun: true }, 'down');
    expect(await findTabs()).toEqual(tabsAfterUp);

    await runCommand({}, 'down');
    expect(await findTabs()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Call Recording', icon: 'IconVideo' }),
      ]),
    );
    expect(
      (await findWidgets()).every((widget) => widget.title === 'Transcript'),
    ).toBe(true);

    await runCommand();
    expect(
      (await findTabs()).every(
        (tab) => tab.title === 'Transcript' && tab.icon === 'IconBlockquote',
      ),
    ).toBe(true);
  });
});
