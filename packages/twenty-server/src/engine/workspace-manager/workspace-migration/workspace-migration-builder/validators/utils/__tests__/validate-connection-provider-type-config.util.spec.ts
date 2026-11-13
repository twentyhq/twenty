import { type StoredOAuthConnectionProviderConfig } from 'twenty-shared/application';

import { validateConnectionProviderTypeConfig } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-connection-provider-type-config.util';

const OAUTH_CONFIG: StoredOAuthConnectionProviderConfig = {
  authorizationEndpoint: 'https://example.com/oauth/authorize',
  tokenEndpoint: 'https://example.com/oauth/token',
  revokeEndpoint: null,
  scopes: [],
  clientIdVariable: 'EXAMPLE_CLIENT_ID',
  clientSecretVariable: 'EXAMPLE_CLIENT_SECRET',
  authorizationParams: null,
  tokenRequestContentType: 'json',
  usePkce: true,
};

const IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER =
  'b648f87b-1d26-4961-b974-0908fd991061';

describe('validateConnectionProviderTypeConfig', () => {
  it('should accept an oauth provider with a complete oauthConfig', () => {
    expect(
      validateConnectionProviderTypeConfig({
        type: 'oauth',
        oauthConfig: OAUTH_CONFIG,
        oauthDiscoveryConfig: null,
        customConfig: null,
        identifyAccountLogicFunctionUniversalIdentifier: null,
      }),
    ).toEqual([]);
  });

  it('should reject an oauth provider without oauthConfig', () => {
    const errors = validateConnectionProviderTypeConfig({
      type: 'oauth',
      oauthConfig: null,
      oauthDiscoveryConfig: null,
      customConfig: null,
      identifyAccountLogicFunctionUniversalIdentifier: null,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain('missing oauthConfig');
  });

  it('should report each missing required oauth field', () => {
    const errors = validateConnectionProviderTypeConfig({
      type: 'oauth',
      oauthConfig: { ...OAUTH_CONFIG, tokenEndpoint: '', clientIdVariable: '' },
      oauthDiscoveryConfig: null,
      customConfig: null,
      identifyAccountLogicFunctionUniversalIdentifier: null,
    });

    expect(errors.map((error) => error.message)).toEqual([
      'Connection provider oauthConfig.tokenEndpoint is required',
      'Connection provider oauthConfig.clientIdVariable is required',
    ]);
  });

  it('should accept an apiKey provider with an identifyAccount logic function', () => {
    expect(
      validateConnectionProviderTypeConfig({
        type: 'apiKey',
        oauthConfig: null,
        oauthDiscoveryConfig: null,
        customConfig: null,
        identifyAccountLogicFunctionUniversalIdentifier:
          IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
      }),
    ).toEqual([]);
  });

  it('should reject an apiKey provider without an identifyAccount logic function', () => {
    const errors = validateConnectionProviderTypeConfig({
      type: 'apiKey',
      oauthConfig: null,
      oauthDiscoveryConfig: null,
      customConfig: null,
      identifyAccountLogicFunctionUniversalIdentifier: null,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain('identifyAccount');
  });

  it('should reject an apiKey provider with an oauthConfig', () => {
    const errors = validateConnectionProviderTypeConfig({
      type: 'apiKey',
      oauthConfig: OAUTH_CONFIG,
      oauthDiscoveryConfig: null,
      customConfig: null,
      identifyAccountLogicFunctionUniversalIdentifier:
        IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain(
      'must not have an oauthConfig, oauthDiscoveryConfig or customConfig',
    );
  });

  it('should accept an oauth-discovery provider with an http resourceUrl', () => {
    expect(
      validateConnectionProviderTypeConfig({
        type: 'oauth-discovery',
        oauthConfig: null,
        oauthDiscoveryConfig: { resourceUrl: 'https://mcp.linear.app/mcp' },
        customConfig: null,
        identifyAccountLogicFunctionUniversalIdentifier: null,
      }),
    ).toEqual([]);
  });

  it('should reject an oauth-discovery provider without a resourceUrl', () => {
    const errors = validateConnectionProviderTypeConfig({
      type: 'oauth-discovery',
      oauthConfig: null,
      oauthDiscoveryConfig: null,
      customConfig: null,
      identifyAccountLogicFunctionUniversalIdentifier: null,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain('oauthDiscoveryConfig.resourceUrl');
  });

  it('should accept a custom provider with authorize and callback logic functions', () => {
    expect(
      validateConnectionProviderTypeConfig({
        type: 'custom',
        oauthConfig: null,
        oauthDiscoveryConfig: null,
        customConfig: {
          authorizeLogicFunctionUniversalIdentifier:
            '0f5c8f0e-3c39-4a3b-9a59-2f1c1d3b4a10',
          callbackLogicFunctionUniversalIdentifier:
            '9a4a7c1e-62f4-4d7b-8b8f-2b2e8d5c6f21',
        },
        identifyAccountLogicFunctionUniversalIdentifier: null,
      }),
    ).toEqual([]);
  });

  it('should reject a custom provider without customConfig', () => {
    const errors = validateConnectionProviderTypeConfig({
      type: 'custom',
      oauthConfig: null,
      oauthDiscoveryConfig: null,
      customConfig: null,
      identifyAccountLogicFunctionUniversalIdentifier: null,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain('authorize and a callback');
  });

  it('should reject an unknown type', () => {
    const errors = validateConnectionProviderTypeConfig({
      type: 'basicAuth' as never,
      oauthConfig: null,
      oauthDiscoveryConfig: null,
      customConfig: null,
      identifyAccountLogicFunctionUniversalIdentifier: null,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain('basicAuth');
  });
});
