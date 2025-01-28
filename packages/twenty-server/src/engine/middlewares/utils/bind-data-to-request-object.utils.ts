import { Request } from 'express';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export const bindDataToRequestObject = (
  data: AuthContext,
  request: Request,
  metadataVersion: number | undefined,
) => {
  request.user = data.user;
  request.apiKey = data.apiKey;
  request.workspace = data.workspace;
  request.workspaceId = data.workspace.id;
  request.workspaceMetadataVersion = metadataVersion;
  request.workspaceMemberId = data.workspaceMemberId;

  return;
};
