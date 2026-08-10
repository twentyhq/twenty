import { isNonEmptyString } from '@sniptt/guards';

import { type WorkspaceSetupWorkspaceContext } from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-workspace-context.type';

export const buildWorkspaceContextMessageText = ({
  workspaceDisplayName,
  workspaceSubdomain,
  userEmail,
}: WorkspaceSetupWorkspaceContext): string => {
  const workspaceNameSegment = isNonEmptyString(workspaceDisplayName)
    ? `named "${workspaceDisplayName}"`
    : 'not named yet';

  return `This workspace is ${workspaceNameSegment} (subdomain: ${workspaceSubdomain}). The admin setting it up signed up with ${userEmail}.`;
};
