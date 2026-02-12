import {
  INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_IFRAME_CONFIG_EMPTY_URL,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE,
  INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY,
  INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  TEST_IFRAME_CONFIG,
} from 'test/integration/constants/widget-configuration-test-data.constants';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { type UpdatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget.input';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

const DEFAULT_GRID_POSITION = {
  row: 0,
  column: 0,
  rowSpan: 1,
  columnSpan: 1,
};

describe('Page layout widget update should fail', () => {
  it('when updating a non-existent page layout widget', async () => {
    const { errors } = await updateOnePageLayoutWidget({
      expectToFail: true,
      input: {
        id: 'ed3752e3-db7f-42ff-82c0-2757a5410044',
        title: 'Updated Title',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  describe('Widget configuration validation failures on update', () => {
    let testPageLayoutId: string;
    let testPageLayoutTabId: string;
    let testPageLayoutWidgetId: string;

    beforeAll(async () => {
      const { data: layoutData } = await createOnePageLayout({
        expectToFail: false,
        input: { name: 'Test Page Layout For Widget Update Failures' },
      });

      testPageLayoutId = layoutData.createPageLayout.id;

      const { data: tabData } = await createOnePageLayoutTab({
        expectToFail: false,
        input: {
          title: 'Test Tab For Widget Update Failures',
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

    beforeEach(async () => {
      const { data } = await createOnePageLayoutWidget({
        expectToFail: false,
        input: {
          title: 'Original Widget',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.IFRAME,
          configuration: TEST_IFRAME_CONFIG,
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      testPageLayoutWidgetId = data.createPageLayoutWidget.id;
    });

    afterEach(async () => {
      await destroyOnePageLayoutWidget({
        expectToFail: false,
        input: { id: testPageLayoutWidgetId },
      });
    });

    describe('IFRAME widget configuration validation failures', () => {
      it('when updating IFRAME configuration with invalid URL', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration: {
              ...INVALID_IFRAME_CONFIG_BAD_URL,
              configurationType: WidgetConfigurationType.IFRAME,
            },
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('when updating IFRAME configuration with empty URL', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration: {
              ...INVALID_IFRAME_CONFIG_EMPTY_URL,
              configurationType: WidgetConfigurationType.IFRAME,
            },
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    });

    describe('STANDALONE_RICH_TEXT widget configuration validation failures', () => {
      it('when updating to STANDALONE_RICH_TEXT with missing body', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration: {
              ...INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY,
              configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
            } as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('when updating to STANDALONE_RICH_TEXT with wrong body type', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration: {
              ...INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE,
              configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
            } as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    });

    describe('AGGREGATE_CHART widget configuration validation failures', () => {
      it('when updating to AGGREGATE_CHART with missing required fields', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration:
              INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('when updating to AGGREGATE_CHART with invalid UUID', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration:
              INVALID_NUMBER_CHART_CONFIG_BAD_UUID as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    });

    describe('BAR_CHART widget configuration validation failures', () => {
      it('when updating to BAR_CHART with missing group by field (vertical)', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration:
              INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('when updating to BAR_CHART with missing group by field (horizontal)', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration:
              INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    });

    describe('Edge case configuration validation failures', () => {
      it('when updating configuration to null', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration:
              null as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('when updating configuration with missing configurationType', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration: {
              someField: 'value',
            } as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });

      it('when updating configuration with unsupported configurationType', async () => {
        const { errors } = await updateOnePageLayoutWidget({
          expectToFail: true,
          input: {
            id: testPageLayoutWidgetId,
            configuration: {
              configurationType: 'UNSUPPORTED_TYPE',
              someField: 'value',
            } as unknown as UpdatePageLayoutWidgetInput['configuration'],
          },
        });

        expectOneNotInternalServerErrorSnapshot({ errors });
      });
    });
  });
});
