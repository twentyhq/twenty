import { Bundle, ZObject } from 'zapier-platform-core';

import { SERVER_BASE_URL } from './utils/contants';
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
      label: 'API Key',
      type: 'string',
      helpText:
        `Create an API key for your workspace. You can generate a key through the [developer dashboard](${SERVER_BASE_URL}/settings/developers)`,
    },
  ],
  connectionLabel: '{{data.currentWorkspace.displayName}}',
  customConfig: {},
};
