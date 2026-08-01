import { Test, type TestingModule } from '@nestjs/testing';

import { type NextFunction, type Request, type Response } from 'express';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { CookieSessionCsrfMiddleware } from 'src/engine/middlewares/cookie-session-csrf.middleware';

describe('CookieSessionCsrfMiddleware', () => {
  let middleware: CookieSessionCsrfMiddleware;

  const mockConfig: Record<string, unknown> = {
    SERVER_URL: 'https://crm.example.com',
    FRONTEND_URL: 'https://front.example.com',
    AUTH_COOKIE_ALLOWED_ORIGINS: '',
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CookieSessionCsrfMiddleware,
        UserSessionCookieService,
        {
          provide: TwentyConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    middleware = module.get<CookieSessionCsrfMiddleware>(
      CookieSessionCsrfMiddleware,
    );
    next = jest.fn();
  });

  it('should skip safe methods', () => {
    const request = buildRequest({
      method: 'GET',
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://evil.example.org',
      },
    });

    middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should skip bearer-authenticated requests', () => {
    const request = buildRequest({
      headers: {
        authorization: 'Bearer some-jwt',
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://evil.example.org',
      },
    });

    middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should skip requests without a session cookie', () => {
    const request = buildRequest({
      headers: {
        origin: 'https://evil.example.org',
      },
    });

    middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow cookie requests without an Origin header', () => {
    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
      },
    });

    middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow same-origin cookie requests', () => {
    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://crm.example.com',
      },
    });

    middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should allow allowlisted cross-origin cookie requests', () => {
    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://front.example.com',
      },
    });

    middleware.use(request, buildResponse(), next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject cookie requests from sibling subdomains', () => {
    const request = buildRequest({
      headers: {
        cookie: '__Host-twenty-session=sess_token',
        origin: 'https://other-workspace.example.com',
      },
    });
    const response = buildResponse();

    middleware.use(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'CSRF_ORIGIN_MISMATCH' }),
    );
  });
});
