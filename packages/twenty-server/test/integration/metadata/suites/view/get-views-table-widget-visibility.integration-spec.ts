import gql from 'graphql-tag';
import { fetchTestFieldMetadataIds } from 'test/integration/metadata/suites/page-layout-widget/utils/fetch-test-field-metadata-ids.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { destroyOneView } from 'test/integration/metadata/suites/view/utils/destroy-one-view.util';
import { ViewType, ViewVisibility } from 'twenty-shared/types';

const getViewsByTypeQuery = gql`
  query GetViews($viewTypes: [ViewType!]) {
    getViews(viewTypes: $viewTypes) {
      id
      type
      visibility
    }
  }
`;

describe('getViews table widget visibility', () => {
  let tableWidgetViewId: string;
  let unlistedTableViewId: string;

  beforeAll(async () => {
    const testFieldMetadataIds = await fetchTestFieldMetadataIds();

    const { data: tableWidgetViewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Visibility Test Table Widget View',
        objectMetadataId: testFieldMetadataIds.objectMetadataId,
        icon: 'IconTable',
        type: ViewType.TABLE_WIDGET,
        visibility: ViewVisibility.UNLISTED,
      },
    });

    tableWidgetViewId = tableWidgetViewData.createView.id;

    const { data: unlistedTableViewData } = await createOneView({
      expectToFail: false,
      input: {
        name: 'Visibility Test Unlisted Table View',
        objectMetadataId: testFieldMetadataIds.objectMetadataId,
        icon: 'IconTable',
        type: ViewType.TABLE,
        visibility: ViewVisibility.UNLISTED,
      },
    });

    unlistedTableViewId = unlistedTableViewData.createView.id;
  });

  afterAll(async () => {
    await destroyOneView({
      expectToFail: false,
      viewId: tableWidgetViewId,
    });

    await destroyOneView({
      expectToFail: false,
      viewId: unlistedTableViewId,
    });
  });

  it('should return unlisted table widget views for non-creator users', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: getViewsByTypeQuery,
        variables: { viewTypes: [ViewType.TABLE_WIDGET] },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const views = response.body.data.getViews as Array<{ id: string }>;

    expect(views.some((view) => view.id === tableWidgetViewId)).toBe(true);
  });

  it('should keep non-widget unlisted views hidden from non-creator users', async () => {
    const response = await makeMetadataAPIRequest(
      {
        query: getViewsByTypeQuery,
        variables: { viewTypes: [ViewType.TABLE] },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toBeUndefined();

    const views = response.body.data.getViews as Array<{ id: string }>;

    expect(views.some((view) => view.id === unlistedTableViewId)).toBe(false);
  });
});
