import { Bundle } from 'zapier-platform-core';

const getBundle = (inputData?: { [x: string]: any }): Bundle => {
  return {
    authData: { apiKey: String(process.env.API_KEY) },
    inputData: inputData || {},
    cleanedRequest: {},
    inputDataRaw: {},
    meta: {
      isBulkRead: false,
      isFillingDynamicDropdown: false,
      isLoadingSample: false,
      isPopulatingDedupe: false,
      isTestingAuth: false,
      limit: 1,
      page: 1,
    },
  };
};
export default getBundle;
