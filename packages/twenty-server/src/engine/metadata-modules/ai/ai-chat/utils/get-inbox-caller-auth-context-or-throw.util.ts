import { msg } from '@lingui/core/macro';

import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { AuthenticationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type AgentInboxCallerAuthContext } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-inbox-caller-auth-context.type';

export const getInboxCallerAuthContextOrThrow =
  (): AgentInboxCallerAuthContext => {
    const authContext = getWorkspaceAuthContext();

    if (
      isUserAuthContext(authContext) ||
      isApplicationAuthContext(authContext)
    ) {
      return authContext;
    }

    throw new AuthenticationError(
      'A workspace member or an application is required',
      {
        userFriendlyMessage: msg`Sign in as a workspace member or use an application token to change this conversation.`,
      },
    );
  };
