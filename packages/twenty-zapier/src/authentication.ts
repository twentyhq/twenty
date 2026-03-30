import type { Bundle, ZObject } from 'zapier-platform-core';

import requestDb from 'src/utils/requestDb';

const CURRENT_WORKSPACE_QUERY =
  'query currentWorkspace {currentWorkspace {id displayName}}';

const shouldRetryOnAlternateEndpoint = (error: unknown) => {
  const message =
    error instanceof Error ? error.message : String(error ?? '');

  return (
    message.includes('Cannot query field "currentWorkspace"') ||
    message.includes('404')
  );
};

const testAuthentication = async (z: ZObject, bundle: Bundle) => {
  try {
    return await requestDb({
      z,
      bundle,
      query: CURRENT_WORKSPACE_QUERY,
      endpoint: 'metadata',
    });
  } catch (error) {
    if (!shouldRetryOnAlternateEndpoint(error)) {
      throw error;
    }

    return await requestDb({
      z,
      bundle,
      query: CURRENT_WORKSPACE_QUERY,
      endpoint: 'graphql',
    });
  }
};

export default {
  type: 'custom',
  test: testAuthentication,
  fields: [
    {
      computed: false,
      key: 'apiKey',
      required: true,
      label: 'Api Key',
      type: 'string',
      helpText:
        'Create an API key in [your twenty workspace](https://app.twenty.com/settings/apis)',
    },
    {
      computed: false,
      key: 'apiUrl',
      required: false,
      label: 'Self hosted instance url',
      type: 'string',
      placeholder: 'https://crm.custom-url.com',
      helpText: 'Set this only if you self-host Twenty',
    },
  ],
  connectionLabel: '{{data.currentWorkspace.displayName}}',
  customConfig: {},
};
