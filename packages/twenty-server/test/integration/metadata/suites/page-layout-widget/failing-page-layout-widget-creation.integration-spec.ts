import { faker } from '@faker-js/faker';
import { TEST_IFRAME_CONFIG } from 'test/integration/constants/widget-configuration-test-data.constants';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

describe('Page layout widget creation should fail', () => {
  let testPageLayoutId: string;
  let testPageLayoutTabId: string;

  beforeAll(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Widget Creation Failures' },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Test Tab For Widget Creation Failures',
        pageLayoutId: testPageLayoutId,
      },
    });

    testPageLayoutTabId = tabData.createPageLayoutTab.id;
  });

  afterAll(async () => {
    await destroyOnePageLayoutTab({
      expectToFail: false,
      input: { id: testPageLayoutTabId },
    });
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it('when title is missing', async () => {
    const { errors } = await createOnePageLayoutWidget({
      expectToFail: true,
      input: {
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.IFRAME,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
        configuration: TEST_IFRAME_CONFIG,
      } as CreatePageLayoutWidgetInput,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when pageLayoutTabId references non-existent tab', async () => {
    const { errors } = await createOnePageLayoutWidget({
      expectToFail: true,
      input: {
        title: 'Widget With Non-Existent Tab',
        pageLayoutTabId: faker.string.uuid(),
        type: WidgetType.IFRAME,
        configuration: TEST_IFRAME_CONFIG,
        gridPosition: {
          row: 0,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('when gridPosition has invalid values', async () => {
    const { errors } = await createOnePageLayoutWidget({
      expectToFail: true,
      input: {
        title: 'Widget With Invalid Grid Position',
        pageLayoutTabId: testPageLayoutTabId,
        type: WidgetType.IFRAME,
        configuration: TEST_IFRAME_CONFIG,
        gridPosition: {
          row: -1,
          column: 0,
          rowSpan: 1,
          columnSpan: 1,
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
