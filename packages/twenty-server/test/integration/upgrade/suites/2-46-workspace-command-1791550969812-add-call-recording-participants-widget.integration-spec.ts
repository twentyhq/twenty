import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode, WidgetType } from 'twenty-shared/types';

import { type AddCallRecordingParticipantsWidgetCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791550969812-add-call-recording-participants-widget.command';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const CALL_RECORDING_HOME_TAB =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs.home;

describe('2-46 workspace command 1791550969812 - AddCallRecordingParticipantsWidgetCommand (integration)', () => {
  let command: AddCallRecordingParticipantsWidgetCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;

  const runCommand = (direction: 'up' | 'down') =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command[direction](RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readHomeTab = async () => {
    const { flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    return {
      tab: flatPageLayoutTabMaps.byUniversalIdentifier[
        CALL_RECORDING_HOME_TAB.universalIdentifier
      ],
      participantsWidget:
        flatPageLayoutWidgetMaps.byUniversalIdentifier[
          CALL_RECORDING_HOME_TAB.widgets.participants.universalIdentifier
        ],
      fieldsWidget:
        flatPageLayoutWidgetMaps.byUniversalIdentifier[
          CALL_RECORDING_HOME_TAB.widgets.fields.universalIdentifier
        ],
    };
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddCallRecordingParticipantsWidgetCommand>(
      'AddCallRecordingParticipantsWidgetCommand',
    );
    workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
      'WorkspaceOrmManager',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  afterAll(async () => {
    await runCommand('up');
  });

  it('adds the participants widget below the existing home tab widgets', async () => {
    await runCommand('down');

    expect((await readHomeTab()).participantsWidget).toBeUndefined();

    await runCommand('up');

    const { tab, participantsWidget, fieldsWidget } = await readHomeTab();

    expect(participantsWidget).toMatchObject({
      pageLayoutTabId: tab?.id,
      type: WidgetType.CALENDAR_EVENT_PARTICIPANTS,
      position: {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index:
          fieldsWidget?.position?.layoutMode ===
          PageLayoutTabLayoutMode.VERTICAL_LIST
            ? fieldsWidget.position.index + 1
            : undefined,
      },
      deletedAt: null,
    });
  });

  it('leaves an existing participants widget as it is', async () => {
    const before = await readHomeTab();

    await runCommand('up');

    expect((await readHomeTab()).participantsWidget?.id).toBe(
      before.participantsWidget?.id,
    );
  });
});
