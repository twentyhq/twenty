import { faker } from '@faker-js/faker';
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
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';

import { type CreatePageLayoutWidgetInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/create-page-layout-widget.input';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

const DEFAULT_GRID_POSITION = {
  row: 0,
  column: 0,
  rowSpan: 1,
  columnSpan: 1,
};

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

  describe('General validation failures', () => {
    it('when title is missing', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.IFRAME,
          gridPosition: DEFAULT_GRID_POSITION,
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
          gridPosition: DEFAULT_GRID_POSITION,
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

  describe('IFRAME widget configuration validation failures', () => {
    it('when IFRAME configuration has invalid URL', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Invalid URL',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.IFRAME,
          configuration: {
            ...INVALID_IFRAME_CONFIG_BAD_URL,
            configurationType: WidgetConfigurationType.IFRAME,
          },
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when IFRAME configuration has empty URL', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Empty URL',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.IFRAME,
          configuration: {
            ...INVALID_IFRAME_CONFIG_EMPTY_URL,
            configurationType: WidgetConfigurationType.IFRAME,
          },
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });

  describe('STANDALONE_RICH_TEXT widget configuration validation failures', () => {
    it('when STANDALONE_RICH_TEXT configuration has missing body', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Missing Body',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.STANDALONE_RICH_TEXT,
          configuration: {
            ...INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY,
            configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
          } as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when STANDALONE_RICH_TEXT configuration has wrong body type', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Wrong Body Type',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.STANDALONE_RICH_TEXT,
          configuration: {
            ...INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE,
            configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
          } as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });

  describe('AGGREGATE_CHART widget configuration validation failures', () => {
    it('when AGGREGATE_CHART configuration has missing required fields', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Missing Fields',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.GRAPH,
          configuration:
            INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when AGGREGATE_CHART configuration has invalid UUID', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Bad UUID',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.GRAPH,
          configuration:
            INVALID_NUMBER_CHART_CONFIG_BAD_UUID as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });

  describe('BAR_CHART widget configuration validation failures', () => {
    it('when VERTICAL BAR_CHART configuration is missing group by field', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Vertical Bar Chart Missing Group By',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.GRAPH,
          configuration:
            INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when HORIZONTAL BAR_CHART configuration is missing group by field', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Horizontal Bar Chart Missing Group By',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.GRAPH,
          configuration:
            INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });

  describe('Edge case configuration validation failures', () => {
    it('when configuration is null', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Null Config',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.IFRAME,
          configuration:
            null as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when configuration has missing configurationType', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Missing Config Type',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.IFRAME,
          configuration: {
            someField: 'value',
          } as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });

    it('when configuration has unsupported configurationType', async () => {
      const { errors } = await createOnePageLayoutWidget({
        expectToFail: true,
        input: {
          title: 'Widget With Unsupported Config Type',
          pageLayoutTabId: testPageLayoutTabId,
          type: WidgetType.IFRAME,
          configuration: {
            configurationType: 'UNSUPPORTED_TYPE',
            someField: 'value',
          } as unknown as CreatePageLayoutWidgetInput['configuration'],
          gridPosition: DEFAULT_GRID_POSITION,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });
});
