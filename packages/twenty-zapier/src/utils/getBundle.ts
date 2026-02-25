import { type Bundle } from 'zapier-platform-core';

import { type InputData } from 'src/utils/data.types';

export const getBundle = (inputData?: InputData): Bundle => {
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
