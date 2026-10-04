import { Logger } from '@nestjs/common';

import { WorkspaceMemberUpdateOnePostQueryHook } from 'src/modules/workspace-member/query-hooks/workspace-member-update-one.post-query.hook';

const WORKSPACE_ID = 'workspace-id';
const WORKSPACE_MEMBER_ID = 'workspace-member-id';
const USER_ID = 'user-id';
const USER_WORKSPACE_ID = 'user-workspace-id';

const buildHook = ({
  workspaceMember,
  userWorkspace,
}: {
  workspaceMember: { id: string; userId: string; locale: string } | null;
  userWorkspace: { id: string; locale: string } | null;
}) => {
  const workspaceMemberRepository = {
    findOne: jest.fn().mockResolvedValue(workspaceMember),
  };
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn((callback: () => unknown) => callback()),
    getRepository: jest.fn().mockReturnValue(workspaceMemberRepository),
  };
  const userWorkspaceRepository = {
    findOne: jest.fn().mockResolvedValue(userWorkspace),
  };
  const userWorkspaceService = {
    updateUserWorkspaceLocaleForUserWorkspace: jest.fn(),
  };

  const hook = new WorkspaceMemberUpdateOnePostQueryHook(
    workspaceOrmManager as never,
    userWorkspaceRepository as never,
    userWorkspaceService as never,
  );

  return {
    hook,
    workspaceMemberRepository,
    userWorkspaceRepository,
    userWorkspaceService,
  };
};

const authContext = { workspace: { id: WORKSPACE_ID } } as never;

describe('WorkspaceMemberUpdateOnePostQueryHook', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('copies a locale changed through the record API to the user workspace', async () => {
    const {
      hook,
      workspaceMemberRepository,
      userWorkspaceRepository,
      userWorkspaceService,
    } = buildHook({
      workspaceMember: {
        id: WORKSPACE_MEMBER_ID,
        userId: USER_ID,
        locale: 'de-DE',
      },
      userWorkspace: { id: USER_WORKSPACE_ID, locale: 'en' },
    });

    // The record API only returns the selected fields
    await hook.execute(authContext, 'workspaceMember', {
      id: WORKSPACE_MEMBER_ID,
    } as never);

    expect(workspaceMemberRepository.findOne).toHaveBeenCalledTimes(1);
    expect(workspaceMemberRepository.findOne).toHaveBeenCalledWith({
      where: { id: WORKSPACE_MEMBER_ID },
    });
    expect(userWorkspaceRepository.findOne).toHaveBeenCalledTimes(1);
    expect(userWorkspaceRepository.findOne).toHaveBeenCalledWith({
      where: { workspaceId: WORKSPACE_ID, userId: USER_ID },
    });
    expect(
      userWorkspaceService.updateUserWorkspaceLocaleForUserWorkspace,
    ).toHaveBeenCalledTimes(1);
    expect(
      userWorkspaceService.updateUserWorkspaceLocaleForUserWorkspace,
    ).toHaveBeenCalledWith({
      locale: 'de-DE',
      userWorkspaceId: USER_WORKSPACE_ID,
    });
  });

  it('does not fail the committed update when the sync throws', async () => {
    const { hook, userWorkspaceService } = buildHook({
      workspaceMember: {
        id: WORKSPACE_MEMBER_ID,
        userId: USER_ID,
        locale: 'de-DE',
      },
      userWorkspace: { id: USER_WORKSPACE_ID, locale: 'en' },
    });

    userWorkspaceService.updateUserWorkspaceLocaleForUserWorkspace.mockRejectedValueOnce(
      new Error('connection reset'),
    );
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    await expect(
      hook.execute(authContext, 'workspaceMember', {
        id: WORKSPACE_MEMBER_ID,
      } as never),
    ).resolves.toBeUndefined();

    expect(
      userWorkspaceService.updateUserWorkspaceLocaleForUserWorkspace,
    ).toHaveBeenCalledTimes(1);
    expect(Logger.prototype.error).toHaveBeenCalledTimes(1);
  });

  it('leaves the user workspace alone when the locale already matches', async () => {
    const { hook, userWorkspaceService } = buildHook({
      workspaceMember: {
        id: WORKSPACE_MEMBER_ID,
        userId: USER_ID,
        locale: 'de-DE',
      },
      userWorkspace: { id: USER_WORKSPACE_ID, locale: 'de-DE' },
    });

    await hook.execute(authContext, 'workspaceMember', {
      id: WORKSPACE_MEMBER_ID,
    } as never);

    expect(
      userWorkspaceService.updateUserWorkspaceLocaleForUserWorkspace,
    ).not.toHaveBeenCalled();
  });

  it('does nothing when the workspace member cannot be found', async () => {
    const { hook, userWorkspaceRepository, userWorkspaceService } = buildHook({
      workspaceMember: null,
      userWorkspace: null,
    });

    await hook.execute(authContext, 'workspaceMember', {
      id: WORKSPACE_MEMBER_ID,
    } as never);

    expect(userWorkspaceRepository.findOne).not.toHaveBeenCalled();
    expect(
      userWorkspaceService.updateUserWorkspaceLocaleForUserWorkspace,
    ).not.toHaveBeenCalled();
  });
});
