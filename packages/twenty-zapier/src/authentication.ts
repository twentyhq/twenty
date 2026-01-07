import type { Bundle, ZObject } from 'zapier-platform-core';

import requestDb from './utils/requestDb';

const testAuthentication = async (z: ZObject, bundle: Bundle) => {
  return await requestDb(
    z,
    bundle,
    'query currentWorkspace {currentWorkspace {id displayName}}',
  );
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
