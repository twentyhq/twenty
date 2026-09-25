import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({ getWorkspaceContext: jest.fn() }),
);

const setup = (userRoleId: string | undefined = 'member-role') => {
  const repository = {};
  const getRepository = jest.fn().mockReturnValue(repository);
  const manager = new WorkspaceOrmManager(
    {} as never,
    { getDataSource: () => ({ getRepository }) } as never,
    {} as never,
  );
  jest.mocked(getWorkspaceContext).mockReturnValue({
    authContext: {
      type: 'user',
      userWorkspaceId: 'membership',
      application: { defaultRoleId: 'application-role' },
    },
    userWorkspaceRoleMap: { membership: userRoleId },
    apiKeyRoleMap: {},
  } as never);
  return { manager, getRepository, repository };
};

describe('Domain repository permissions', () => {
  it('intersects member and application roles rather than using a privileged repository', () => {
    const { manager, getRepository, repository } = setup();
    expect(manager.getRepositoryWithContextPermissions('note')).toBe(
      repository,
    );
    expect(getRepository).toHaveBeenCalledWith(
      'note',
      { intersectionOf: ['member-role', 'application-role'] },
      { shouldSkipEventEmission: false, shouldBypassValidationRules: false },
    );
  });

  it('keeps the same role intersection inside a transaction', () => {
    const { manager, getRepository } = setup();
    const transactionalRepository = jest.fn();
    manager.getRepositoryWithContextPermissions('note', {
      getRepository: transactionalRepository,
    } as never);
    expect(transactionalRepository).toHaveBeenCalledWith('note', {
      intersectionOf: ['member-role', 'application-role'],
    });
    expect(getRepository).not.toHaveBeenCalled();
  });

  it('fails closed when the user no longer has a role', () => {
    const { manager, getRepository } = setup();
    jest.mocked(getWorkspaceContext).mockReturnValue({
      authContext: { type: 'user', userWorkspaceId: 'membership' },
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: {},
    } as never);
    expect(() => manager.getRepositoryWithContextPermissions('note')).toThrow();
    expect(getRepository).not.toHaveBeenCalled();
  });
});
