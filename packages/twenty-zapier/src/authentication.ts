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
    {
      computed: false,
      key: 'apiUrl',
      required: false,
      label: 'Api Url',
      type: 'string',
      helpText:
        'Leave blank if you use app.twenty.com. If you self-host Twenty, please set your Twenty server url (same as variable REACT_APP_SERVER_BASE_URL in https://docs.twenty.com/start/self-hosting/).',
    },
  ],
  connectionLabel: '{{data.currentWorkspace.displayName}}',
  customConfig: {},
};
