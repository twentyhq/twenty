import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { PageLayoutType, WidgetType } from 'twenty-shared/types';

import { type AddChatRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-44/2-44-workspace-command-1790756589463-add-chat-record-page.command';
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

const CHAT_RECORD_PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.agentChatThreadRecordPage;

describe('2-44 workspace command 1790756589463 - AddChatRecordPageCommand (integration)', () => {
  let command: AddChatRecordPageCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;

  const runCommand = (direction: 'up' | 'down') =>
    workspaceOrmManager.executeInWorkspaceContext(
      () => command[direction](RUN_ON_WORKSPACE_ARGS),
      buildSystemAuthContext(SEED_APPLE_WORKSPACE_ID),
    );

  const readChatRecordPage = async () => {
    const {
      flatObjectMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatObjectMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);
    const pageLayout =
      flatPageLayoutMaps.byUniversalIdentifier[
        CHAT_RECORD_PAGE.universalIdentifier
      ];
    const tab =
      flatPageLayoutTabMaps.byUniversalIdentifier[
        CHAT_RECORD_PAGE.tabs.chat.universalIdentifier
      ];
    const widget =
      flatPageLayoutWidgetMaps.byUniversalIdentifier[
        CHAT_RECORD_PAGE.tabs.chat.widgets.chat.universalIdentifier
      ];

    return {
      chatObjectId:
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ]?.id,
      pageLayout,
      tab,
      widget,
    };
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddChatRecordPageCommand>(
      'AddChatRecordPageCommand',
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

  it('gives chats a record page whose only tab renders the conversation', async () => {
    await runCommand('down');

    const beforeUp = await readChatRecordPage();

    expect(beforeUp.pageLayout).toBeUndefined();
    expect(beforeUp.tab).toBeUndefined();
    expect(beforeUp.widget).toBeUndefined();

    await runCommand('up');

    const { chatObjectId, pageLayout, tab, widget } =
      await readChatRecordPage();

    expect(pageLayout).toMatchObject({
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: chatObjectId,
      deletedAt: null,
    });
    expect(tab).toMatchObject({
      pageLayoutId: pageLayout?.id,
      deletedAt: null,
    });
    expect(widget).toMatchObject({
      pageLayoutTabId: tab?.id,
      type: WidgetType.CHAT,
      deletedAt: null,
    });
  });

  it('leaves an existing chat record page as it is', async () => {
    const before = await readChatRecordPage();

    await runCommand('up');

    const after = await readChatRecordPage();

    expect(after.pageLayout?.id).toBe(before.pageLayout?.id);
    expect(after.tab?.id).toBe(before.tab?.id);
    expect(after.widget?.id).toBe(before.widget?.id);
  });
});
