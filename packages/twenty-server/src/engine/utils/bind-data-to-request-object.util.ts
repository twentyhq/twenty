import { type Request } from 'express';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export const bindDataToRequestObject = (
  data: AuthContext,
  request: Request,
  metadataVersion: number | undefined,
) => {
  request.user = data.user;
  request.apiKey = data.apiKey;
  request.application = data.application;
  request.userWorkspace = data.userWorkspace;
  request.workspace = data.workspace;
  request.workspaceId = data.workspace?.id;
  request.workspaceMetadataVersion = metadataVersion;
  request.workspaceMemberId = data.workspaceMemberId;
  request.workspaceMember = data.workspaceMember;
  request.userWorkspaceId = data.userWorkspaceId;
  request.authProvider = data.authProvider;
  request.impersonationContext = data.impersonationContext;

  request.locale =
    data.userWorkspace?.locale ??
    (request.headers['x-locale'] as keyof typeof APP_LOCALES) ??
    SOURCE_LOCALE;
};
