import { isNonEmptyString } from '@sniptt/guards';

import { WORKSPACE_CONTEXT_DISPLAY_NAME_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-context-display-name-max-length.constant';
import { WORKSPACE_CONTEXT_USER_EMAIL_MAX_LENGTH } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-context-user-email-max-length.constant';
import { type WorkspaceSetupWorkspaceContext } from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-workspace-context.type';
import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

export const buildWorkspaceContextMessageText = ({
  workspaceDisplayName,
  workspaceSubdomain,
  userEmail,
}: WorkspaceSetupWorkspaceContext): string => {
  const sanitizedWorkspaceDisplayName = sanitizePromptContextLine({
    value: workspaceDisplayName,
    maxLength: WORKSPACE_CONTEXT_DISPLAY_NAME_MAX_LENGTH,
  });
  const workspaceNameSegment = isNonEmptyString(sanitizedWorkspaceDisplayName)
    ? `named "${sanitizedWorkspaceDisplayName}"`
    : 'not named yet';

  const sanitizedUserEmail = sanitizePromptContextLine({
    value: userEmail,
    maxLength: WORKSPACE_CONTEXT_USER_EMAIL_MAX_LENGTH,
  });
  const adminSegment = isNonEmptyString(sanitizedUserEmail)
    ? `The admin setting it up signed up with ${sanitizedUserEmail}.`
    : 'The admin setting it up has no email on file.';

  return `This workspace is ${workspaceNameSegment} (subdomain: ${workspaceSubdomain}). ${adminSegment}`;
};
