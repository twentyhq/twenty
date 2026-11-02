import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({ getWorkspaceContext: jest.fn() }),
);

const setup = (authContext: Record<string, unknown>) => {
  const repository = {};
  const getRepository = jest.fn().mockReturnValue(repository);
  const manager = new WorkspaceOrmManager(
    {} as never,
    { getDataSource: () => ({ getRepository }) } as never,
    {} as never,
    {} as never,
  );
  jest.mocked(getWorkspaceContext).mockReturnValue({
    authContext: { workspace: { id: 'workspace-id' }, ...authContext },
  } as never);
  return { manager, getRepository, repository };
};

const USER_AUTH_CONTEXT = {
  type: 'user',
  workspaceMemberId: 'workspace-member-id',
  application: { id: 'application-id' },
};

const USER_PRINCIPALS = {
  principals: {
    workspaceId: 'workspace-id',
    mainPrincipal: {
      type: 'workspaceMember',
      workspaceMemberId: 'workspace-member-id',
    },
    applicationPrincipal: {
      type: 'application',
      applicationId: 'application-id',
    },
  },
};

describe('Domain repository permissions', () => {
  it('scopes the repository to the member and application principals rather than a privileged repository', () => {
    const { manager, getRepository, repository } = setup(USER_AUTH_CONTEXT);
    expect(manager.getRepositoryWithContextPermissions('note')).toBe(
      repository,
    );
    expect(getRepository).toHaveBeenCalledWith('note', USER_PRINCIPALS, {
      shouldSkipEventEmission: false,
    });
  });

  it('keeps the same principals inside a transaction', () => {
    const { manager, getRepository } = setup(USER_AUTH_CONTEXT);
    const transactionalRepository = jest.fn();
    manager.getRepositoryWithContextPermissions('note', {
      getRepository: transactionalRepository,
    } as never);
    expect(transactionalRepository).toHaveBeenCalledWith(
      'note',
      USER_PRINCIPALS,
    );
    expect(getRepository).not.toHaveBeenCalled();
  });

  it('fails closed when the auth context names no principal', () => {
    const { manager, getRepository } = setup({
      type: 'pendingActivationUser',
      userWorkspaceId: 'user-workspace-id',
    });
    expect(() => manager.getRepositoryWithContextPermissions('note')).toThrow();
    expect(getRepository).not.toHaveBeenCalled();
  });
});
