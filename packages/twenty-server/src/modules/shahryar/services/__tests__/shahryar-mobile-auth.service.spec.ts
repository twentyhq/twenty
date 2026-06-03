import { AuthException } from 'src/engine/core-modules/auth/auth.exception';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ShahryarMobileAuthService } from 'src/modules/shahryar/services/shahryar-mobile-auth.service';
import { DataSource } from 'typeorm';

describe('ShahryarMobileAuthService', () => {
  const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

  let authService: jest.Mocked<
    Pick<AuthService, 'validateLoginWithPassword' | 'verify'>
  >;
  let coreDataSource: jest.Mocked<Pick<DataSource, 'query'>>;
  let service: ShahryarMobileAuthService;
  let workspaceDomainsService: jest.Mocked<
    Pick<WorkspaceDomainsService, 'getWorkspaceByOriginOrDefaultWorkspace'>
  >;

  beforeEach(() => {
    authService = {
      validateLoginWithPassword: jest.fn(),
      verify: jest.fn(),
    };
    coreDataSource = {
      query: jest.fn(),
    };
    workspaceDomainsService = {
      getWorkspaceByOriginOrDefaultWorkspace: jest.fn(),
    };
    service = new ShahryarMobileAuthService(
      authService as unknown as AuthService,
      workspaceDomainsService as unknown as WorkspaceDomainsService,
      coreDataSource as unknown as DataSource,
    );
  });

  it('should resolve a Shahryar username before using standard password auth', async () => {
    const workspace = {
      id: WORKSPACE_ID,
    } as WorkspaceEntity;
    const authTokens = {
      tokens: {
        accessOrWorkspaceAgnosticToken: {
          token: 'access-token',
          expiresAt: new Date('2026-06-01T10:00:00.000Z'),
        },
        refreshToken: {
          token: 'refresh-token',
          expiresAt: new Date('2026-06-08T10:00:00.000Z'),
        },
      },
    };

    workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace.mockResolvedValue(
      workspace,
    );
    coreDataSource.query.mockResolvedValue([
      {
        userEmail: 'karwan@example.test',
      },
    ]);
    authService.validateLoginWithPassword.mockResolvedValue({
      email: 'karwan@example.test',
    } as Awaited<ReturnType<AuthService['validateLoginWithPassword']>>);
    authService.verify.mockResolvedValue(authTokens);

    await expect(
      service.signInWithUsername({
        origin: 'https://api.example.test',
        username: 'karwan',
        password: 'password',
      }),
    ).resolves.toEqual(authTokens);
    expect(
      workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace,
    ).toHaveBeenCalledWith('https://api.example.test');
    expect(coreDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('LOWER("username") = LOWER($1)'),
      ['karwan'],
    );
    expect(authService.validateLoginWithPassword).toHaveBeenCalledWith(
      {
        email: 'karwan@example.test',
        password: 'password',
      },
      workspace,
    );
    expect(authService.verify).toHaveBeenCalledWith(
      'karwan@example.test',
      WORKSPACE_ID,
      AuthProviderEnum.Password,
    );
  });

  it('should reject duplicate Shahryar usernames', async () => {
    workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace.mockResolvedValue(
      {
        id: WORKSPACE_ID,
      } as WorkspaceEntity,
    );
    coreDataSource.query.mockResolvedValue([
      {
        userEmail: 'karwan@example.test',
      },
      {
        userEmail: 'karwan-duplicate@example.test',
      },
    ]);

    await expect(
      service.signInWithUsername({
        origin: 'https://api.example.test',
        username: 'karwan',
        password: 'password',
      }),
    ).rejects.toThrow(AuthException);
    expect(authService.validateLoginWithPassword).not.toHaveBeenCalled();
    expect(authService.verify).not.toHaveBeenCalled();
  });
});
