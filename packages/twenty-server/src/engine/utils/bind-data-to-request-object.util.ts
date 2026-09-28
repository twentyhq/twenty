import { type Request } from 'express';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { getRequestLocaleFromHeader } from 'src/engine/utils/get-request-locale-from-header.util';

export const bindDataToRequestObject = (
  data: RawAuthContext,
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
  request.tokenType = data.tokenType;
  request.authenticatedAt = data.authenticatedAt;

  request.locale =
    data.userWorkspace?.locale ?? getRequestLocaleFromHeader(request);
};
