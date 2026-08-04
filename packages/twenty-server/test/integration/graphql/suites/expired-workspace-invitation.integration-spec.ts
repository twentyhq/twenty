import { type Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { AuthService } from 'src/engine/core-modules/auth/services/auth.service';
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

describe('expired workspace invitation filtering', () => {
  const email = 'expired-invitation-filtering@example.com';
  const workspaceId = SEED_APPLE_WORKSPACE_ID;
  const workspace = { id: workspaceId } as WorkspaceEntity;

  let appTokenRepository: Repository<AppTokenEntity>;
  let workspaceInvitationService: WorkspaceInvitationService;
  let authService: AuthService;

  const removeSeededInvitations = () =>
    global.testDataSource.query(
      `DELETE FROM core."appToken" WHERE "workspaceId" = $1 AND context->>'email' = $2`,
      [workspaceId, email],
    );

  const seedInvitation = (expiresAt: Date) =>
    appTokenRepository.save(
      appTokenRepository.create({
        workspaceId,
        type: AppTokenType.InvitationToken,
        value: `expired-invitation-filtering-${expiresAt.getTime()}`,
        expiresAt,
        context: { email },
      }),
    );

  beforeAll(() => {
    appTokenRepository = getCoreRepository(AppTokenEntity);
    workspaceInvitationService = global.app.get(WorkspaceInvitationService, {
      strict: false,
    });
    authService = global.app.get(AuthService, { strict: false });
  });

  afterEach(() => removeSeededInvitations());

  it('getOneWorkspaceInvitation ignores an expired invitation', async () => {
    await seedInvitation(new Date(Date.now() - ONE_HOUR_IN_MS));

    const invitation =
      await workspaceInvitationService.getOneWorkspaceInvitation(
        workspaceId,
        email,
      );

    expect(invitation).toBeNull();
  });

  it('getOneWorkspaceInvitation still returns a valid invitation', async () => {
    await seedInvitation(new Date(Date.now() + ONE_HOUR_IN_MS));

    const invitation =
      await workspaceInvitationService.getOneWorkspaceInvitation(
        workspaceId,
        email,
      );

    expect(invitation?.context?.email).toBe(email);
  });

  it('findInvitationForSignInUp ignores an expired invitation', async () => {
    await seedInvitation(new Date(Date.now() - ONE_HOUR_IN_MS));

    const invitation = await authService.findInvitationForSignInUp({
      currentWorkspace: workspace,
      email,
    });

    expect(invitation).toBeUndefined();
  });

  it('createWorkspaceInvitation re-invites an email whose only invitation is expired', async () => {
    await seedInvitation(new Date(Date.now() - ONE_HOUR_IN_MS));

    await expect(
      workspaceInvitationService.createWorkspaceInvitation(email, workspace),
    ).resolves.toBeDefined();
  });
});
