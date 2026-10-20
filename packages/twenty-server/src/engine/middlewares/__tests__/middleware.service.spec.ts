import { Logger } from '@nestjs/common';

import { type Request } from 'express';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { type UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { type UserSessionService } from 'src/engine/core-modules/user-session/services/user-session.service';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

describe('MiddlewareService', () => {
  const authError = new AuthException(
    'Session revoked',
    AuthExceptionCode.UNAUTHENTICATED,
  );

  let bearerToken: string | null;
  let accessTokenService: { validateTokenByRequest: jest.Mock };
  let userSessionCookieService: {
    extractSessionTokenFromRequest: jest.Mock;
    clearSessionCookie: jest.Mock;
  };
  let userSessionService: { isSessionTokenSuperseded: jest.Mock };
  let request: Request;
  let service: MiddlewareService;

  beforeEach(() => {
    bearerToken = null;

    accessTokenService = {
      validateTokenByRequest: jest.fn().mockRejectedValue(authError),
    };
    userSessionCookieService = {
      extractSessionTokenFromRequest: jest.fn().mockReturnValue('sess_old'),
      clearSessionCookie: jest.fn(),
    };
    userSessionService = {
      isSessionTokenSuperseded: jest.fn().mockResolvedValue(false),
    };

    const jwtWrapperService = {
      extractJwtFromRequest: jest.fn(() => () => bearerToken),
    };

    request = { headers: {}, res: {} } as unknown as Request;

    service = new MiddlewareService(
      accessTokenService as unknown as AccessTokenService,
      {} as never,
      {} as never,
      {} as never,
      jwtWrapperService as unknown as JwtWrapperService,
      userSessionCookieService as unknown as UserSessionCookieService,
      userSessionService as unknown as UserSessionService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('hydrateGraphqlRequest', () => {
    it('should keep the cookie of a superseded session and rethrow the error', async () => {
      userSessionService.isSessionTokenSuperseded.mockResolvedValue(true);

      await expect(service.hydrateGraphqlRequest(request)).rejects.toBe(
        authError,
      );

      expect(userSessionService.isSessionTokenSuperseded).toHaveBeenCalledWith(
        'sess_old',
      );
      expect(
        userSessionCookieService.clearSessionCookie,
      ).not.toHaveBeenCalled();
    });

    it('should clear the cookie of a session that is not superseded', async () => {
      await expect(service.hydrateGraphqlRequest(request)).rejects.toBe(
        authError,
      );

      expect(userSessionCookieService.clearSessionCookie).toHaveBeenCalledWith(
        request.res,
      );
    });

    it('should wait for the cookie decision before rethrowing the error', async () => {
      let resolveLookup: (isSuperseded: boolean) => void = () => {};

      userSessionService.isSessionTokenSuperseded.mockReturnValue(
        new Promise<boolean>((resolve) => {
          resolveLookup = resolve;
        }),
      );

      let isSettled = false;
      const hydrationError = service
        .hydrateGraphqlRequest(request)
        .catch((error: unknown) => {
          isSettled = true;

          return error;
        });

      for (let tick = 0; tick < 10; tick++) {
        await Promise.resolve();
      }

      expect(userSessionService.isSessionTokenSuperseded).toHaveBeenCalled();
      expect(isSettled).toBe(false);

      resolveLookup(false);

      await expect(hydrationError).resolves.toBe(authError);

      expect(userSessionCookieService.clearSessionCookie).toHaveBeenCalledWith(
        request.res,
      );
    });

    it('should log, clear the cookie and rethrow the original error when the session lookup fails', async () => {
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      userSessionService.isSessionTokenSuperseded.mockRejectedValue(
        new Error('db down'),
      );

      await expect(service.hydrateGraphqlRequest(request)).rejects.toBe(
        authError,
      );

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('db down'));
      expect(userSessionCookieService.clearSessionCookie).toHaveBeenCalledWith(
        request.res,
      );
    });

    it('should clear the cookie without a lookup when no session token is extracted', async () => {
      // isTokenPresent reads the extractor first; keep it true there, then return undefined.
      userSessionCookieService.extractSessionTokenFromRequest
        .mockReturnValueOnce('sess_old')
        .mockReturnValue(undefined);

      await expect(service.hydrateGraphqlRequest(request)).rejects.toBe(
        authError,
      );

      expect(
        userSessionService.isSessionTokenSuperseded,
      ).not.toHaveBeenCalled();
      expect(userSessionCookieService.clearSessionCookie).toHaveBeenCalledWith(
        request.res,
      );
    });

    it('should neither look up the session nor clear the cookie for a Bearer request', async () => {
      bearerToken = 'jwt';

      await expect(service.hydrateGraphqlRequest(request)).rejects.toBe(
        authError,
      );

      expect(
        userSessionService.isSessionTokenSuperseded,
      ).not.toHaveBeenCalled();
      expect(
        userSessionCookieService.clearSessionCookie,
      ).not.toHaveBeenCalled();
    });

    it('should not look up the session for an error outside the dead-session codes', async () => {
      const suspendedError = new AuthException(
        'Suspended',
        AuthExceptionCode.WORKSPACE_SUSPENDED,
      );

      accessTokenService.validateTokenByRequest.mockRejectedValue(
        suspendedError,
      );

      await expect(service.hydrateGraphqlRequest(request)).rejects.toBe(
        suspendedError,
      );

      expect(
        userSessionService.isSessionTokenSuperseded,
      ).not.toHaveBeenCalled();
      expect(
        userSessionCookieService.clearSessionCookie,
      ).not.toHaveBeenCalled();
    });
  });
});
