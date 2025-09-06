import { type GraphQLResponse } from 'test/integration/graphql/utils/graphql-test-assertions.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

import { type PageLayoutWidgetEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-widget.entity';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';

import { createPageLayoutWidgetOperationFactory } from './create-page-layout-widget-operation-factory.util';
import { destroyPageLayoutWidgetOperationFactory } from './destroy-page-layout-widget-operation-factory.util';
import { findPageLayoutWidgetsOperationFactory } from './find-page-layout-widgets-operation-factory.util';

interface CreatePageLayoutWidgetResponse extends Record<string, unknown> {
  createPageLayoutWidget: PageLayoutWidgetEntity;
}

export const createTestPageLayoutWidgetWithGraphQL = async (data: {
  title: string;
  type?: WidgetType;
  pageLayoutTabId: string;
  objectMetadataId?: string | null;
  gridPosition?: {
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
  };
  configuration?: Record<string, unknown> | null;
}): Promise<PageLayoutWidgetEntity> => {
  const operation = createPageLayoutWidgetOperationFactory({
    data: {
      title: data.title,
      type: data.type || WidgetType.VIEW,
      pageLayoutTabId: data.pageLayoutTabId,
      objectMetadataId: data.objectMetadataId || null,
      gridPosition: data.gridPosition || {
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      },
      configuration: data.configuration || null,
    },
  });

  const response = (await makeGraphqlAPIRequest(
    operation,
  )) as GraphQLResponse<CreatePageLayoutWidgetResponse>;

  if (response.body.errors) {
    throw new Error(
      `Failed to create test page layout widget: ${JSON.stringify(response.body.errors)}`,
    );
  }

  if (!response.body.data) {
    throw new Error(
      'No data returned from createTestPageLayoutWidgetWithGraphQL',
    );
  }

  return response.body.data.createPageLayoutWidget;
};

export const cleanupPageLayoutWidgetRecordsWithGraphQL = async (
  pageLayoutTabId: string,
): Promise<void> => {
  const operation = findPageLayoutWidgetsOperationFactory({ pageLayoutTabId });
  const response = await makeGraphqlAPIRequest(operation);

  if (response.body.data?.getPageLayoutWidgets) {
    for (const pageLayoutWidget of response.body.data.getPageLayoutWidgets) {
      const destroyOperation = destroyPageLayoutWidgetOperationFactory({
        pageLayoutWidgetId: pageLayoutWidget.id,
      });

      await makeGraphqlAPIRequest(destroyOperation);
    }
  }
};
