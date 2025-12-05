import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

import { type PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

export const createTestPageLayoutWithRestApi = async (
  overrides: Partial<PageLayoutEntity> = {},
): Promise<PageLayoutEntity> => {
  const pageLayoutData = {
    name: generateRecordName('Test Page Layout'),
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataId: null,
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/pageLayouts',
    body: pageLayoutData,
    bearer: API_KEY_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test page layout: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const deleteTestPageLayoutWithRestApi = async (
  pageLayoutId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/pageLayouts/${pageLayoutId}`,
    bearer: API_KEY_ACCESS_TOKEN,
  }).catch(() => {});
};
