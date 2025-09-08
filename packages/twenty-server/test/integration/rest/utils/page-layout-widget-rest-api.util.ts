import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

import { type PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';

export const createTestPageLayoutWidgetWithRestApi = async (
  overrides: Partial<PageLayoutWidgetEntity> = {},
): Promise<PageLayoutWidgetEntity> => {
  const pageLayoutWidgetData = {
    title: generateRecordName('Test Page Layout Widget'),
    type: WidgetType.VIEW,
    gridPosition: {
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    },
    ...overrides,
  };

  const response = await makeRestAPIRequest({
    method: 'post',
    path: '/metadata/page-layout-widgets',
    body: pageLayoutWidgetData,
    bearer: API_KEY_ACCESS_TOKEN,
  });

  if (response.status !== 201) {
    throw new Error(
      `Failed to create test page layout widget: ${response.status} - ${JSON.stringify(response.body)}`,
    );
  }

  return response.body;
};

export const deleteTestPageLayoutWidgetWithRestApi = async (
  pageLayoutWidgetId: string,
): Promise<void> => {
  await makeRestAPIRequest({
    method: 'delete',
    path: `/metadata/page-layout-widgets/${pageLayoutWidgetId}`,
    bearer: API_KEY_ACCESS_TOKEN,
  });
};
