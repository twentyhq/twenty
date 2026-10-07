import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import {
  type DashboardFilterTestFieldMetadataIds,
  fetchDashboardFilterTestFieldMetadataIds,
} from 'test/integration/metadata/suites/page-layout/utils/fetch-dashboard-filter-test-field-metadata-ids.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import {
  AggregateOperations,
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const CHART_TITLE = 'Companies created per month';

describe('Page layout dashboard filters persistence should fail', () => {
  let fieldMetadataIds: DashboardFilterTestFieldMetadataIds;
  let testPageLayoutId: string;
  let testTabId: string;

  beforeAll(async () => {
    fieldMetadataIds = await fetchDashboardFilterTestFieldMetadataIds();
  });

  beforeEach(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard with invalid filters',
        type: PageLayoutType.DASHBOARD,
      },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Overview',
        pageLayoutId: testPageLayoutId,
      },
    });

    testTabId = tabData.createPageLayoutTab.id;
  });

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  const buildTabs = (
    dashboardFilterBindings: Record<string, DashboardFilterBinding | null>,
  ) => [
    {
      id: testTabId,
      title: 'Overview',
      position: 0,
      widgets: [
        {
          id: v4(),
          pageLayoutTabId: testTabId,
          title: CHART_TITLE,
          type: WidgetType.GRAPH,
          objectMetadataId: fieldMetadataIds.companyObjectMetadataId,
          position: {
            layoutMode: PageLayoutTabLayoutMode.GRID as const,
            row: 0,
            column: 0,
            rowSpan: 1,
            columnSpan: 1,
          },
          configuration: {
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId:
              fieldMetadataIds.companyPositionFieldMetadataId,
            aggregateOperation: AggregateOperations.COUNT,
            dashboardFilterBindings,
          } satisfies AllPageLayoutWidgetConfiguration,
        },
      ],
    },
  ];

  it('when a chart binds a slot to a field of another object', async () => {
    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with invalid filters',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        dashboardFilters: [DATE_SLOT],
        tabs: buildTabs({
          date: {
            fieldMetadataId: fieldMetadataIds.personCreatedAtFieldMetadataId,
          },
        }),
      },
    });

    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);

    const [firstError] = errors!;

    expect(firstError.extensions.code).toBe('BAD_USER_INPUT');
    expect(firstError.message).toContain(`Chart "${CHART_TITLE}":`);
    expect(firstError.message).toContain('Dashboard filter "date"');
    expect(firstError.message).toContain(
      `must be bound to a field of objectMetadataId "${fieldMetadataIds.companyObjectMetadataId}"`,
    );
    expect(String(firstError.extensions.userFriendlyMessage)).toContain(
      `Chart "${CHART_TITLE}":`,
    );
  });

  it('when two slots share the same id', async () => {
    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with invalid filters',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        dashboardFilters: [DATE_SLOT, { ...DATE_SLOT, label: 'Other date' }],
        tabs: buildTabs({}),
      },
    });

    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);

    const [firstError] = errors!;

    // Slot checks live in the flat page layout validator, so they surface
    // as a metadata validation failure rather than a BAD_USER_INPUT
    expect(firstError.extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(String(firstError.extensions.userFriendlyMessage)).toBe(
      'Dashboard filter ids must be unique',
    );
    expect(firstError.extensions.errors.pageLayout).toEqual([
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            code: 'INVALID_PAGE_LAYOUT_DATA',
            message: 'Dashboard filter id "date" is used more than once',
          }),
        ],
      }),
    ]);
  });

  it('when a slot has an unknown filter type', async () => {
    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with invalid filters',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        dashboardFilters: [
          {
            ...DATE_SLOT,
            filterType: 'RICH_TEXT' as DashboardFilterSlot['filterType'],
          },
        ],
        tabs: buildTabs({}),
      },
    });

    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);

    const [firstError] = errors!;

    expect(firstError.extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(String(firstError.extensions.userFriendlyMessage)).toBe(
      'A dashboard filter has an unsupported type',
    );
    expect(firstError.extensions.errors.pageLayout).toEqual([
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            code: 'INVALID_PAGE_LAYOUT_DATA',
            value: 'RICH_TEXT',
          }),
        ],
      }),
    ]);
  });
  it('when a chart binds a DATE_TIME slot to a TEXT field', async () => {
    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with invalid filters',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        dashboardFilters: [DATE_SLOT],
        tabs: buildTabs({
          date: {
            fieldMetadataId: fieldMetadataIds.companyNameFieldMetadataId,
          },
        }),
      },
    });

    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);

    const [firstError] = errors!;

    expect(firstError.extensions.code).toBe('BAD_USER_INPUT');
    expect(firstError.message).toContain(`Chart "${CHART_TITLE}":`);
    expect(firstError.message).toContain(
      'Dashboard filter "date" expects a DATE_TIME field but is bound to "Name" (TEXT).',
    );
    expect(String(firstError.extensions.userFriendlyMessage)).toContain(
      `Chart "${CHART_TITLE}":`,
    );
  });

  it('when a chart binds a slot that is not defined on the layout', async () => {
    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with invalid filters',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        dashboardFilters: [DATE_SLOT],
        tabs: buildTabs({
          owner: {
            fieldMetadataId:
              fieldMetadataIds.companyAccountOwnerFieldMetadataId,
          },
        }),
      },
    });

    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);

    const [firstError] = errors!;

    expect(firstError.extensions.code).toBe('BAD_USER_INPUT');
    expect(firstError.message).toContain(
      `Chart "${CHART_TITLE}": Dashboard filter "owner" is not defined on this layout.`,
    );
  });
});
