import { type NextFunction, type Request, type Response } from 'express';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PublicFunctionDomainRewriteMiddleware } from 'src/engine/middlewares/public-function-domain-rewrite.middleware';

describe('PublicFunctionDomainRewriteMiddleware', () => {
  const buildMiddleware = (publicDomainUrl?: string) => {
    const twentyConfigService = {
      get: jest.fn((key: string) =>
        key === 'PUBLIC_DOMAIN_URL' ? publicDomainUrl : undefined,
      ),
    } as unknown as TwentyConfigService;

    return new PublicFunctionDomainRewriteMiddleware(twentyConfigService);
  };

  const run = (
    middleware: PublicFunctionDomainRewriteMiddleware,
    { host, url }: { host?: string; url: string },
  ) => {
    const req = { headers: { host }, url } as unknown as Request;
    const next = jest.fn() as unknown as NextFunction;

    middleware.use(req, {} as Response, next);

    return { req, next };
  };

  it('prefixes /s on a public function subdomain request', () => {
    const middleware = buildMiddleware('https://withtwenty.com');

    const { req, next } = run(middleware, {
      host: 'acme.withtwenty.com',
      url: '/webhook/stripe?id=1',
    });

    expect(req.url).toBe('/s/webhook/stripe?id=1');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rewrites the root path', () => {
    const middleware = buildMiddleware('https://withtwenty.com');

    const { req } = run(middleware, {
      host: 'acme.withtwenty.com',
      url: '/',
    });

    expect(req.url).toBe('/s/');
  });

  it('does not double-prefix an already /s/ prefixed url', () => {
    const middleware = buildMiddleware('https://withtwenty.com');

    const { req } = run(middleware, {
      host: 'acme.withtwenty.com',
      url: '/s/webhook',
    });

    expect(req.url).toBe('/s/webhook');
  });

  it('leaves the main app domain untouched', () => {
    const middleware = buildMiddleware('https://withtwenty.com');

    const { req, next } = run(middleware, {
      host: 'acme.twenty.com',
      url: '/graphql',
    });

    expect(req.url).toBe('/graphql');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('is a no-op when no public domain base is configured (self-hosting)', () => {
    const middleware = buildMiddleware(undefined);

    const { req } = run(middleware, {
      host: 'acme.withtwenty.com',
      url: '/webhook',
    });

    expect(req.url).toBe('/webhook');
  });
});
