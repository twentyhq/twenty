import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const signUpOperationFactory = ({
  email,
  password,
  workspaceInviteHash,
  workspaceId,
}: {
  email: string;
  password: string;
  workspaceInviteHash?: string;
  workspaceId?: string;
}) => ({
  query: `
      mutation SignUpInWorkspace {
        signUpInWorkspace(
            email: "${email}"
            password: "${password}"
            workspaceInviteHash: "${workspaceInviteHash ?? 'apple.dev-invite-hash'}"
            workspaceId: "${workspaceId ?? SEED_APPLE_WORKSPACE_ID}"
        ) {
          workspace { id }
        }
      }
    `,
});
