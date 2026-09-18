import { type Request } from 'express';
import { type APP_LOCALES, SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { REQUEST_ACTOR_HEADER } from 'src/engine/constants/request-attribution-headers.constant';
import { computeRequestActor } from 'src/engine/utils/compute-request-actor.util';

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
    data.userWorkspace?.locale ??
    (request.headers['x-locale'] as keyof typeof APP_LOCALES) ??
    SOURCE_LOCALE;

  const actor = computeRequestActor(data);

  // The impersonator is deliberately left out: it would travel to the
  // impersonated session before the edge strips the header.
  if (isDefined(actor) && isDefined(request.res)) {
    request.res.setHeader(REQUEST_ACTOR_HEADER, actor);
  }
};
