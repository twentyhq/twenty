import { type Bundle } from 'zapier-platform-core';

import { type InputData } from 'src/utils/data.types';

const ADMIN_TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC1lNmI1LTQ2ODAtOGEzMi1iODIwOTczNzE1NmIiLCJ1c2VySWQiOiIyMDIwMjAyMC1lNmI1LTQ2ODAtOGEzMi1iODIwOTczNzE1NmIiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtNDYzZi00MzViLTgyOGMtMTA3ZTAwN2EyNzExIiwidXNlcldvcmtzcGFjZUlkIjoiMjAyMDIwMjAtMWU3Yy00M2Q5LWE1ZGItNjg1YjUwNjlkODE2IiwidHlwZSI6IkFDQ0VTUyIsImF1dGhQcm92aWRlciI6InBhc3N3b3JkIiwiaWF0IjoxNzUxMjgxNzA0LCJleHAiOjIwNjY4NTc3MDR9.HMGqCsVlOAPVUBhKSGlD1X86VoHKt4LIUtET3CGIdik';
const TEST_URL = 'http://localhost:3000';

export const getBundleForTest = (inputData?: InputData): Bundle => {
  return {
    authData: {
      apiKey: ADMIN_TEST_TOKEN,
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
    },
  };
};
