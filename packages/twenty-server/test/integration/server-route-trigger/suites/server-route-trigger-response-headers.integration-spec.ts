import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupHttpResponseLogicFunctionApplication } from 'test/integration/route-trigger/utils/setup-http-response-logic-function-application.util';
import { HTTPMethod } from 'twenty-shared/types';

const ROUTE_RESPONSE_SANDBOX_POLICY =
  'sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads';

const HTML_PAGE_WITH_SCRIPT =
  '<!doctype html><html><body><script>window.serverRouteScriptRan = true</script></body></html>';

const HTML_RESPONSE = {
  status: 200,
  headers: { 'content-type': 'text/html; charset=utf-8' },
  body: HTML_PAGE_WITH_SCRIPT,
};

const GET_SERVER_ROUTE_TRIGGER_SETTINGS = {
  serverRouteTriggerSettings: {
    forwardedRequestHeaders: [],
    httpMethods: [HTTPMethod.GET],
  },
};

describe('ServerRouteTrigger response headers (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const foreignWorkspaceHost = `yc.localhost:${APP_PORT}`;

  it('serves an HTML resolver response as a sandboxed document', async () => {
    const { applicationUniversalIdentifier, logicFunctionId } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Server Route Response Headers HTML App',
        response: HTML_RESPONSE,
        triggerSettings: GET_SERVER_ROUTE_TRIGGER_SETTINGS,
      });

    try {
      const response = await request(baseUrl).get(
        `/webhooks/server/${logicFunctionId}`,
      );

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

  it('serves an HTML resolver response as a sandboxed document on the host of a workspace that does not own the app', async () => {
    const { applicationUniversalIdentifier, logicFunctionId } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Server Route Response Headers Foreign Host App',
        response: HTML_RESPONSE,
        triggerSettings: GET_SERVER_ROUTE_TRIGGER_SETTINGS,
      });

    try {
      const response = await request(baseUrl)
        .get(`/webhooks/server/${logicFunctionId}`)
        .set('Host', foreignWorkspaceHost);

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

  it('serves an HTML resolver response as a sandboxed document on the registration-scoped route', async () => {
    const {
      applicationRegistrationId,
      applicationUniversalIdentifier,
      logicFunctionUniversalIdentifier,
    } = await setupHttpResponseLogicFunctionApplication({
      name: 'Server Route Response Headers Registration App',
      response: HTML_RESPONSE,
      triggerSettings: GET_SERVER_ROUTE_TRIGGER_SETTINGS,
    });

    try {
      const response = await request(baseUrl)
        .get(
          `/webhooks/server/${applicationRegistrationId}/${logicFunctionUniversalIdentifier}`,
        )
        .set('Host', foreignWorkspaceHost);

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

  it('does not let a resolver replace the sandbox and nosniff headers', async () => {
    const { applicationUniversalIdentifier, logicFunctionId } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Server Route Response Headers Override App',
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
        triggerSettings: GET_SERVER_ROUTE_TRIGGER_SETTINGS,
      });

    try {
      const response = await request(baseUrl).get(
        `/webhooks/server/${logicFunctionId}`,
      );

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

  it('answers a webhook with the JSON body, status and allowed headers the resolver chose', async () => {
    const { applicationUniversalIdentifier, logicFunctionId } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Server Route Response Headers JSON App',
        response: {
          status: 202,
          headers: {
            'cache-control': 'no-store',
            'retry-after': '30',
            'x-not-allowed': 'dropped',
          },
          body: { accepted: true },
        },
        triggerSettings: {
          serverRouteTriggerSettings: { forwardedRequestHeaders: [] },
        },
      });

    try {
      const response = await request(baseUrl)
        .post(`/webhooks/server/${logicFunctionId}`)
        .send({ event: 'ping' });

      expect(response.status).toBe(202);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toEqual({ accepted: true });
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.headers['retry-after']).toBe('30');
      expect(response.headers['x-not-allowed']).toBeUndefined();
    } finally {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('answers a verification challenge with the plain text body the resolver chose', async () => {
    const { applicationUniversalIdentifier, logicFunctionId } =
      await setupHttpResponseLogicFunctionApplication({
        name: 'Server Route Response Headers Text App',
        response: {
          status: 200,
          headers: { 'content-type': 'text/plain' },
          body: 'challenge-abc123',
        },
        triggerSettings: GET_SERVER_ROUTE_TRIGGER_SETTINGS,
      });

    try {
      const response = await request(baseUrl).get(
        `/webhooks/server/${logicFunctionId}`,
      );

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(response.text).toBe('challenge-abc123');
    } finally {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);
});
