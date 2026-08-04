import { Test, type TestingModule } from '@nestjs/testing';

import { type NextFunction, type Request, type Response } from 'express';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { CredentialedOriginService } from 'src/engine/core-modules/user-session/services/credentialed-origin.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { CookieSessionCsrfMiddleware } from 'src/engine/middlewares/cookie-session-csrf.middleware';

describe('CookieSessionCsrfMiddleware', () => {
  let middleware: CookieSessionCsrfMiddleware;

  const defaultConfig: Record<string, unknown> = {
    AUTH_COOKIE_SESSIONS_ENABLED: true,
    SERVER_URL: 'https://crm.example.com',
    FRONTEND_URL: 'https://front.example.com',
    AUTH_COOKIE_ALLOWED_ORIGINS: '',
    IS_MULTIWORKSPACE_ENABLED: false,
  };

  let mockConfig: Record<string, unknown> = { ...defaultConfig };

  const mockWorkspaceDomainsService = {
    resolveWorkspaceAndPublicDomain: jest.fn(),
    getWorkspaceUrls: jest.fn(),
  };

  const buildRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      method: 'POST',
      protocol: 'https',
      headers: {},
      get: jest.fn().mockReturnValue('crm.example.com'),
      ...overrides,
    }) as unknown as Request;

  const buildResponse = (): Response => {
    const response = {
      status: jest.fn(),
      json: jest.fn(),
    } as unknown as Response;

    (response.status as jest.Mock).mockReturnValue(response);

    return response;
  };

  let next: NextFunction;

  beforeEach(async () => {
    mockConfig = { ...defaultConfig };
    mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
      { workspace: undefined, publicDomain: null, isIsolatedOrigin: false },
    );
    mockWorkspaceDomainsService.getWorkspaceUrls.mockReturnValue({
      customUrl: undefined,
      subdomainUrl: 'https://front.example.com',
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CookieSessionCsrfMiddleware,
        UserSessionCookieService,
        CredentialedOriginService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
        {
          provide: WorkspaceDomainsService,
          useValue: mockWorkspaceDomainsService,
        },
        {
          provide: JwtWrapperService,
          useValue: {
            extractJwtFromRequest: () => (request: Request) =>
              /^Bearer\s+(\S+)/i.exec(request.headers.authorization ?? '')?.[1],
          },
        },
      ],
    }).compile();

    middleware = module.get<CookieSessionCsrfMiddleware>(
      CookieSessionCsrfMiddleware,
    );
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should skip safe methods', async () => {
    const request = buildRequest({
      method: 'GET',
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://evil.example.org',
      },
    });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should skip bearer-authenticated requests', async () => {
    const request = buildRequest({
      headers: {
        authorization: 'Bearer some-jwt',
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://evil.example.org',
      },
    });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should skip requests without a session cookie', async () => {
    const request = buildRequest({
      headers: {
        origin: 'https://evil.example.org',
      },
    });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject cookie requests without an Origin header', async () => {
    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
      },
    });
    const response = buildResponse();

    await middleware.use(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
  });

  it('should still allow a request without an Origin header when it carries no session cookie', async () => {
    const request = buildRequest({ headers: {} });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow same-origin cookie requests', async () => {
    const request = buildRequest({
      get: jest.fn().mockReturnValue('api.example.com'),
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://api.example.com',
      },
    });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow allowlisted cross-origin cookie requests', async () => {
    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://front.example.com',
      },
    });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow an origin listed only in AUTH_COOKIE_ALLOWED_ORIGINS', async () => {
    mockConfig.AUTH_COOKIE_ALLOWED_ORIGINS = 'https://split.example.net';

    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://split.example.net',
      },
    });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should treat a default port on the host as the same origin', async () => {
    const request = buildRequest({
      get: jest.fn().mockReturnValue('api.example.com:443'),
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://api.example.com',
      },
    });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject cookie requests from sibling subdomains', async () => {
    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://other-workspace.example.com',
      },
    });
    const response = buildResponse();

    await middleware.use(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'CSRF_ORIGIN_MISMATCH' }),
    );
  });

  it('should skip when cookie sessions are disabled', async () => {
    mockConfig.AUTH_COOKIE_SESSIONS_ENABLED = false;

    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://evil.example.com',
      },
    });

    await middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should still guard a cookie request carrying a non-Bearer authorization header', async () => {
    const request = buildRequest({
      headers: {
        authorization: 'Basic dXNlcjpwYXNz',
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://evil.example.com',
      },
    });
    const response = buildResponse();

    await middleware.use(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
  });

  // The middleware guards every route, so callers that never hold a session
  // cookie must pass without needing a per-route exclusion.
  describe('callers that carry no session cookie', () => {
    it('should allow a third-party webhook POST sending no Origin', async () => {
      const request = buildRequest({
        headers: { 'stripe-signature': 'v1=deadbeef' } as Request['headers'],
      });

      await middleware.use(request, buildResponse(), next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow a workflow POST trigger authenticated by an api key', async () => {
      const request = buildRequest({
        headers: {
          authorization: 'Bearer an-api-key',
          origin: 'https://partner.example.org',
        },
      });

      await middleware.use(request, buildResponse(), next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow an app-defined route POST from an arbitrary origin', async () => {
      const request = buildRequest({
        headers: { origin: 'https://partner.example.org' },
      });

      await middleware.use(request, buildResponse(), next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('deployment topologies', () => {
    it('should allow a workspace subdomain posting to its own host', async () => {
      const request = buildRequest({
        get: jest.fn().mockReturnValue('myworkspace.example.com'),
        headers: {
          cookie: '__Host-twenty-session=sess_token',
          origin: 'https://myworkspace.example.com',
        },
      });

      await middleware.use(request, buildResponse(), next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow a front on a separate port from the api', async () => {
      mockConfig.SERVER_URL = 'http://localhost:3000';
      mockConfig.FRONTEND_URL = 'http://localhost:3001';

      const request = buildRequest({
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
        headers: {
          cookie: 'twenty-session=sess_token',
          origin: 'http://localhost:3001',
        },
      });

      await middleware.use(request, buildResponse(), next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow a cross-origin request from an existing workspace subdomain in multiworkspace mode', async () => {
      mockConfig.IS_MULTIWORKSPACE_ENABLED = true;
      mockWorkspaceDomainsService.resolveWorkspaceAndPublicDomain.mockResolvedValue(
        {
          workspace: { subdomain: 'myworkspace' },
          publicDomain: null,
          isIsolatedOrigin: false,
        },
      );
      mockWorkspaceDomainsService.getWorkspaceUrls.mockReturnValue({
        customUrl: undefined,
        subdomainUrl: 'https://myworkspace.front.example.com',
      });

      const request = buildRequest({
        headers: {
          cookie: '__Host-twenty-session=sess_token',
          origin: 'https://myworkspace.front.example.com',
        },
      });

      await middleware.use(request, buildResponse(), next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject a cross-origin request from a front-domain sibling that is not a workspace in multiworkspace mode', async () => {
      mockConfig.IS_MULTIWORKSPACE_ENABLED = true;

      const request = buildRequest({
        headers: {
          cookie: '__Host-twenty-session=sess_token',
          origin: 'https://not-a-workspace.front.example.com',
        },
      });
      const response = buildResponse();

      await middleware.use(request, response, next);

      expect(next).not.toHaveBeenCalled();
      expect(response.status).toHaveBeenCalledWith(403);
    });
  });
});
