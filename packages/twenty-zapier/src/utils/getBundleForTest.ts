import { type Bundle } from 'zapier-platform-core';

import { type InputData } from 'src/utils/data.types';

const API_KEY_TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC0xYzI1LTRkMDItYmYyNS02YWVjY2Y3ZWE0MTkiLCJ0eXBlIjoiQVBJX0tFWSIsIndvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWMyNS00ZDAyLWJmMjUtNmFlY2NmN2VhNDE5IiwiaWF0IjoxNzQ0OTgzNzUwLCJleHAiOjQ4OTg1ODM2OTMsImp0aSI6IjIwMjAyMDIwLWY0MDEtNGQ4YS1hNzMxLTY0ZDAwN2MyN2JhZCJ9.4xkkwz_uu2xzs_V8hJSaM15fGziT5zS3vq2lM48OHr0';
const TEST_URL = 'http://localhost:3000';

export const getBundleForTest = (inputData?: InputData): Bundle => {
  return {
    authData: {
      apiKey: API_KEY_TEST_TOKEN,
      apiUrl: TEST_URL,
    },
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
      timezone: null,
      inputFields: {},
    },
  };
};
