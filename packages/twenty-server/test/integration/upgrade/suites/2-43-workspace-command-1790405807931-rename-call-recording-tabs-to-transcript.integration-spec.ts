import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type RenameCallRecordingTabsToTranscriptCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790405807931-rename-call-recording-tabs-to-transcript.command';
import { TRANSCRIPT_TAB_UNIVERSAL_IDENTIFIERS } from 'src/database/commands/upgrade-version-command/2-43/constants/transcript-tab-universal-identifiers.constant';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
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

describe('RenameCallRecordingTabsToTranscriptCommand (integration)', () => {
  let command: RenameCallRecordingTabsToTranscriptCommand;
  let workspaceOrmManager: WorkspaceOrmManager;
  let workspaceCacheService: WorkspaceCacheService;
  let originalTabs: PageLayoutTabEntity[];
  let workspaceCustomApplicationUniversalIdentifier: string;

  const tabRepository = () =>
    getCoreRepository<PageLayoutTabEntity>(PageLayoutTabEntity);
  const findTabs = () =>
    tabRepository().find({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        universalIdentifier: In(TRANSCRIPT_TAB_UNIVERSAL_IDENTIFIERS),
      },
      order: { universalIdentifier: 'ASC' },
    });
  const refreshCache = () =>
    workspaceCacheService.invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatPageLayoutTabMaps',
    ]);
  const runCommand = ({
    dryRun = false,
    direction = 'up',
  }: { dryRun?: boolean; direction?: 'up' | 'down' } = {}) =>
    workspaceOrmManager.executeInWorkspaceContext(
      () =>
        direction === 'up'
          ? command.runOnWorkspace({
              ...RUN_ON_WORKSPACE_ARGS,
              options: { dryRun },
            })
          : command.down({ ...RUN_ON_WORKSPACE_ARGS, options: { dryRun } }),
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
    const workspace = await getCoreRepository<WorkspaceEntity>(
      WorkspaceEntity,
    ).findOneOrFail({
      where: { id: SEED_APPLE_WORKSPACE_ID },
      relations: { workspaceCustomApplication: true },
    });
    workspaceCustomApplicationUniversalIdentifier =
      workspace.workspaceCustomApplication.universalIdentifier;
    expect(originalTabs).toHaveLength(2);
  });

  beforeEach(async () => {
    await tabRepository().update(
      { id: In(originalTabs.map((tab) => tab.id)) },
      { title: 'Call Recording', icon: 'IconVideo', overrides: null },
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
    if (isDefined(workspaceCacheService)) {
      await refreshCache();
    }
  });

  it('does not write metadata on a dry run', async () => {
    const tabsBefore = await findTabs();

    await runCommand({ dryRun: true });

    expect(await findTabs()).toEqual(tabsBefore);
  });

  it('renames both tabs in place, refreshes the cache and is idempotent', async () => {
    const tabsBefore = await findTabs();

    await runCommand();

    const tabsAfter = await findTabs();
    expect(tabsAfter).toEqual(
      tabsBefore.map((tab) => ({
        ...tab,
        title: 'Transcript',
        icon: 'IconBlockquote',
        updatedAt: expect.anything(),
      })),
    );
    const { flatPageLayoutTabMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatPageLayoutTabMaps',
      ]);
    for (const universalIdentifier of TRANSCRIPT_TAB_UNIVERSAL_IDENTIFIERS) {
      expect(
        flatPageLayoutTabMaps.byUniversalIdentifier[universalIdentifier],
      ).toMatchObject({ title: 'Transcript', icon: 'IconBlockquote' });
    }

    await runCommand();

    expect(await findTabs()).toEqual(tabsAfter);
  });

  it('retains workspace overrides', async () => {
    const overrides = {
      [workspaceCustomApplicationUniversalIdentifier]: {
        title: 'Interview',
        icon: 'IconPhone',
        position: 17,
      },
    };
    await tabRepository().update(originalTabs[0].id, { overrides });
    await refreshCache();

    await runCommand();

    expect((await findTabs())[0]).toMatchObject({
      title: 'Transcript',
      icon: 'IconBlockquote',
      overrides,
    });
  });

  it('restores the previous defaults on down and can upgrade again', async () => {
    await runCommand();
    const tabsAfterUp = await findTabs();

    await runCommand({ dryRun: true, direction: 'down' });
    expect(await findTabs()).toEqual(tabsAfterUp);

    await runCommand({ direction: 'down' });
    expect(
      (await findTabs()).every(
        (tab) => tab.title === 'Call Recording' && tab.icon === 'IconVideo',
      ),
    ).toBe(true);

    await runCommand();
    expect(
      (await findTabs()).every(
        (tab) => tab.title === 'Transcript' && tab.icon === 'IconBlockquote',
      ),
    ).toBe(true);
  });
});
