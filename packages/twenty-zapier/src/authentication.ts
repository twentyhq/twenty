import { Bundle, ZObject } from 'zapier-platform-core';

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
        'Create an API key in [your twenty workspace](https://app.twenty.com/settings/developers)',
    },
  ],
  connectionLabel: '{{data.currentWorkspace.displayName}}',
  customConfig: {},
};
