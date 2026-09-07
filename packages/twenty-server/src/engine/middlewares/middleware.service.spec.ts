import { type Request, type Response } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { type ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { type UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';
import { type WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

const SESSION_TOKEN = 'sess_stale';
const ONE_MINUTE_MS = 60 * 1000;

const buildMiddleware = ({
  resolvedSession,
}: {
  resolvedSession: {
    revokedAt: Date;
    revokedReason: UserSessionRevokedReason;
  } | null;
}) => {
  const clearSessionCookie = jest.fn();
  const validateTokenByRequest = jest
    .fn()
    .mockRejectedValue(
      new AuthException(
        'Session is invalid or has expired.',
        AuthExceptionCode.UNAUTHENTICATED,
      ),
    );
  const findSessionByToken = jest.fn().mockResolvedValue(resolvedSession);

  const middleware = new MiddlewareService(
    { validateTokenByRequest } as unknown as AccessTokenService,
    {} as WorkspaceCacheStorageService,
    {} as WorkspaceManyOrAllFlatEntityMapsCacheService,
    {} as ExceptionHandlerService,
    {
      extractJwtFromRequest: () => () => undefined,
    } as unknown as JwtWrapperService,
    {
      extractSessionTokenFromRequest: () => SESSION_TOKEN,
      clearSessionCookie,
    } as unknown as UserSessionCookieService,
    { findSessionByToken } as unknown as UserSessionService,
  );

  const request = {
    headers: {},
    res: {} as Response,
  } as Request;

  return { clearSessionCookie, findSessionByToken, middleware, request };
};

describe('MiddlewareService', () => {
  it('should preserve the cookie when the request carries a superseded session', async () => {
    const { clearSessionCookie, findSessionByToken, middleware, request } =
      buildMiddleware({
        resolvedSession: {
          revokedAt: new Date(),
          revokedReason: UserSessionRevokedReason.Superseded,
        },
      });

    await expect(middleware.hydrateGraphqlRequest(request)).rejects.toThrow(
      'Session is invalid or has expired.',
    );

    expect(findSessionByToken).toHaveBeenCalledWith(SESSION_TOKEN);
    expect(clearSessionCookie).not.toHaveBeenCalled();
  });

  it('should clear an unknown session cookie', async () => {
    const { clearSessionCookie, middleware, request } = buildMiddleware({
      resolvedSession: null,
    });

    await expect(middleware.hydrateGraphqlRequest(request)).rejects.toThrow(
      'Session is invalid or has expired.',
    );

    expect(clearSessionCookie).toHaveBeenCalledWith(request.res);
  });

  it('should clear a superseded cookie after the response-race window', async () => {
    const { clearSessionCookie, middleware, request } = buildMiddleware({
      resolvedSession: {
        revokedAt: new Date(Date.now() - ONE_MINUTE_MS),
        revokedReason: UserSessionRevokedReason.Superseded,
      },
    });

    await expect(middleware.hydrateGraphqlRequest(request)).rejects.toThrow(
      'Session is invalid or has expired.',
    );

    expect(clearSessionCookie).toHaveBeenCalledWith(request.res);
  });
});
