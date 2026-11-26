import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  deletePublicDomains,
  insertPublicDomain,
} from 'test/integration/route-trigger/utils/public-domain-rows.util';
import { setupHttpResponseLogicFunctionApplication } from 'test/integration/route-trigger/utils/setup-http-response-logic-function-application.util';
import { HTTPMethod } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const ROUTE_RESPONSE_SANDBOX_POLICY =
  'sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads';

const HTML_PAGE_WITH_SCRIPT =
  '<!doctype html><html><body><script>window.routeScriptRan = true</script></body></html>';

const buildPublicGetRouteTriggerSettings = () => {
  const path = `/response-headers-${uuidv4()}`;

  return {
    path,
    triggerSettings: {
      httpRouteTriggerSettings: {
        path,
        httpMethod: HTTPMethod.GET,
        isAuthRequired: false,
      },
    },
  };
};

describe('RouteTrigger response headers (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const workspaceHost = `apple.localhost:${APP_PORT}`;

  it('serves an HTML route response on a workspace host as a sandboxed document', async () => {
    const { path, triggerSettings } = buildPublicGetRouteTriggerSettings();
    const { applicationUniversalIdentifier } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Route Response Headers HTML App',
        response: {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
          body: HTML_PAGE_WITH_SCRIPT,
        },
        triggerSettings,
      });

    try {
      const response = await request(baseUrl)
        .get(`/s${path}`)
        .set('Host', workspaceHost);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
      expect(response.text).toBe(HTML_PAGE_WITH_SCRIPT);
      expect(response.headers['content-security-policy']).toBe(
        ROUTE_RESPONSE_SANDBOX_POLICY,
      );
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    } finally {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('does not let a route function replace the sandbox and nosniff headers on a workspace host', async () => {
    const { path, triggerSettings } = buildPublicGetRouteTriggerSettings();
    const { applicationUniversalIdentifier } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Route Response Headers Override App',
        response: {
          status: 200,
          headers: {
            'content-type': 'text/html',
            'Content-Security-Policy':
              'sandbox allow-scripts allow-same-origin',
            'content-security-policy': "default-src 'self'",
            'X-Content-Type-Options': 'sniff',
            'x-content-type-options': '',
          },
          body: HTML_PAGE_WITH_SCRIPT,
        },
        triggerSettings,
      });

    try {
      const response = await request(baseUrl)
        .get(`/s${path}`)
        .set('Host', workspaceHost);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.headers['content-security-policy']).toBe(
        ROUTE_RESPONSE_SANDBOX_POLICY,
      );
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    } finally {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('serves a JSON route response with the status and allowed headers the function chose', async () => {
    const { path, triggerSettings } = buildPublicGetRouteTriggerSettings();
    const { applicationUniversalIdentifier } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Route Response Headers JSON App',
        response: {
          status: 201,
          headers: {
            'cache-control': 'no-store',
            'content-language': 'en',
            'x-not-allowed': 'dropped',
          },
          body: { created: true },
        },
        triggerSettings,
      });

    try {
      const response = await request(baseUrl)
        .get(`/s${path}`)
        .set('Host', workspaceHost);

      expect(response.status).toBe(201);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toEqual({ created: true });
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.headers['content-language']).toBe('en');
      expect(response.headers['x-not-allowed']).toBeUndefined();
    } finally {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('serves a plain text route response with the status and allowed headers the function chose', async () => {
    const { path, triggerSettings } = buildPublicGetRouteTriggerSettings();
    const { applicationUniversalIdentifier } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Route Response Headers Text App',
        response: {
          status: 202,
          headers: {
            'retry-after': '120',
            'content-disposition': 'attachment; filename="report.txt"',
          },
          body: 'accepted',
        },
        triggerSettings,
      });

    try {
      const response = await request(baseUrl)
        .get(`/s${path}`)
        .set('Host', workspaceHost);

      expect(response.status).toBe(202);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toBe('accepted');
      expect(response.headers['retry-after']).toBe('120');
      expect(response.headers['content-disposition']).toBe(
        'attachment; filename="report.txt"',
      );
    } finally {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('serves an HTML route on a validated application public domain with the headers the function chose and no sandbox', async () => {
    const applicationPublicDomain = `${uuidv4()}.example.com`;
    const { path, triggerSettings } = buildPublicGetRouteTriggerSettings();
    const { applicationId, applicationUniversalIdentifier } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Route Response Headers Public Domain App',
        response: {
          status: 200,
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'content-security-policy': "default-src 'self'",
            'x-application-header': 'kept',
          },
          body: HTML_PAGE_WITH_SCRIPT,
        },
        triggerSettings,
      });

    try {
      await insertPublicDomain({
        domain: applicationPublicDomain,
        isValidated: true,
        applicationId,
      });

      const response = await request(baseUrl)
        .get(`/s${path}`)
        .set('Host', `${applicationPublicDomain}:${APP_PORT}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/html; charset=utf-8');
      expect(response.text).toBe(HTML_PAGE_WITH_SCRIPT);
      expect(response.headers['content-security-policy']).toBe(
        "default-src 'self'",
      );
      expect(response.headers['x-application-header']).toBe('kept');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    } finally {
      await deletePublicDomains([applicationPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('keeps the sandbox on the workspace host for an application that has a validated public domain', async () => {
    const applicationPublicDomain = `${uuidv4()}.example.com`;
    const { path, triggerSettings } = buildPublicGetRouteTriggerSettings();
    const { applicationId, applicationUniversalIdentifier } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Route Response Headers Workspace Host App',
        response: {
          status: 200,
          headers: { 'content-type': 'text/html; charset=utf-8' },
          body: HTML_PAGE_WITH_SCRIPT,
        },
        triggerSettings,
      });

    try {
      await insertPublicDomain({
        domain: applicationPublicDomain,
        isValidated: true,
        applicationId,
      });

      const response = await request(baseUrl)
        .get(`/s${path}`)
        .set('Host', workspaceHost);

      expect(response.status).toBe(200);
      expect(response.text).toBe(HTML_PAGE_WITH_SCRIPT);
      expect(response.headers['content-security-policy']).toBe(
        ROUTE_RESPONSE_SANDBOX_POLICY,
      );
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    } finally {
      await deletePublicDomains([applicationPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('does not serve routes on a host matched only by an unvalidated public domain record', async () => {
    const unvalidatedPublicDomain = `${uuidv4()}.example.com`;
    const { path, triggerSettings } = buildPublicGetRouteTriggerSettings();
    const { applicationId, applicationUniversalIdentifier } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Route Response Headers Unvalidated Domain App',
        response: {
          status: 200,
          headers: {
            'content-type': 'text/html; charset=utf-8',
            'x-application-header': 'not sent',
          },
          body: HTML_PAGE_WITH_SCRIPT,
        },
        triggerSettings,
      });

    try {
      await insertPublicDomain({
        domain: unvalidatedPublicDomain,
        isValidated: false,
        applicationId,
      });

      const response = await request(baseUrl)
        .get(`/s${path}`)
        .set('Host', `${unvalidatedPublicDomain}:${APP_PORT}`);

      expect(response.status).toBe(404);
      expect(response.text).not.toContain('routeScriptRan');
      expect(response.headers['x-application-header']).toBeUndefined();
    } finally {
      await deletePublicDomains([unvalidatedPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('lets a route function choose its own policy on a validated application public domain but keeps nosniff', async () => {
    const applicationPublicDomain = `${uuidv4()}.example.com`;
    const functionPolicy = 'sandbox allow-scripts allow-same-origin';
    const { path, triggerSettings } = buildPublicGetRouteTriggerSettings();
    const { applicationId, applicationUniversalIdentifier } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Route Response Headers Public Domain Override App',
        response: {
          status: 200,
          headers: {
            'content-type': 'text/html',
            'Content-Security-Policy': functionPolicy,
            'X-Content-Type-Options': 'sniff',
          },
          body: HTML_PAGE_WITH_SCRIPT,
        },
        triggerSettings,
      });

    try {
      await insertPublicDomain({
        domain: applicationPublicDomain,
        isValidated: true,
        applicationId,
      });

      const response = await request(baseUrl)
        .get(`/s${path}`)
        .set('Host', `${applicationPublicDomain}:${APP_PORT}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.headers['content-security-policy']).toBe(functionPolicy);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    } finally {
      await deletePublicDomains([applicationPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);
});
