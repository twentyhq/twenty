import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

import { type PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';

export const createTestPageLayoutTabWithRestApi = async (
  overrides: Partial<PageLayoutTabEntity> = {},
): Promise<PageLayoutTabEntity> => {
  const pageLayoutTabData = {
    title: generateRecordName('Test Page Layout Tab'),
    position: 0,
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/page-layout-tabs',
    body: pageLayoutTabData,
    bearer: API_KEY_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test page layout tab: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const deleteTestPageLayoutTabWithRestApi = async (
  pageLayoutTabId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/page-layout-tabs/${pageLayoutTabId}`,
    bearer: API_KEY_ACCESS_TOKEN,
  });
};
