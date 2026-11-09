import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type CompanyNameRlsRoleSetup,
  VISIBLE_COMPANY_NAME_TOKEN,
  cleanupCompanyNameRlsRole,
  setupCompanyNameRlsRole,
} from 'test/integration/graphql/utils/setup-company-name-rls-role.util';
import {
  type DashboardFilterBindingFieldIds,
  fetchDashboardFilterBindingFieldIds,
} from 'test/integration/metadata/suites/page-layout/utils/fetch-dashboard-filter-binding-field-ids.util';
import request, { type Response } from 'supertest';
import { Temporal } from 'temporal-polyfill';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const PERIOD_FILTER_ID = DASHBOARD_DATE_RANGE_FILTER_ID;
const WIDGET_TIME_ZONE = 'Europe/Paris';

const MAIN_TOKEN = 'DashboardFilterMain';
const CAP_TOKEN = 'DashboardFilterCap';
const RELATIVE_TOKEN = 'DashboardFilterRelative';
const RLS_TOKEN = 'DashboardFilterRls';

const CAPPED_COMPANIES_IN_MAY = 60;
const CAPPED_COMPANIES_IN_AUGUST = 41;

type Condition = { operand: ViewFilterOperand; value: string };

const periodValues = (conditions: Condition[]) => [
  { pageLayoutFilterId: PERIOD_FILTER_ID, type: 'DATE', conditions },
];

const MARCH_2019 = periodValues([
  { operand: ViewFilterOperand.IS_AFTER, value: '2019-03-01' },
  { operand: ViewFilterOperand.IS_BEFORE, value: '2019-04-01' },
]);

const MAIN_COMPANIES = [
  {
    name: `${MAIN_TOKEN} 2019-03-01 in Paris`,
    createdAt: '2019-02-28T23:30:00.000Z',
  },
  { name: `${MAIN_TOKEN} 2019-03-10`, createdAt: '2019-03-10T12:00:00.000Z' },
  {
    name: `${MAIN_TOKEN} 2019-04-01 in Paris`,
    createdAt: '2019-03-31T22:30:00.000Z',
  },
  { name: `${MAIN_TOKEN} 2019-04-05`, createdAt: '2019-04-05T12:00:00.000Z' },
];

const MAIN_COMPANY_NAMES_IN_MARCH_IN_PARIS = [
  `${MAIN_TOKEN} 2019-03-01 in Paris`,
  `${MAIN_TOKEN} 2019-03-10`,
];

const CAPPED_COMPANIES = Array.from(
  { length: CAPPED_COMPANIES_IN_MAY + CAPPED_COMPANIES_IN_AUGUST },
  (_, index) => ({
    name: `${CAP_TOKEN} ${String(index).padStart(3, '0')}`,
    createdAt:
      index < CAPPED_COMPANIES_IN_MAY
        ? '2019-05-15T12:00:00.000Z'
        : '2019-08-15T12:00:00.000Z',
  }),
);

const RLS_COMPANIES = [
  {
    name: `${RLS_TOKEN} ${VISIBLE_COMPANY_NAME_TOKEN} Co`,
    createdAt: '2019-06-15T12:00:00.000Z',
  },
  { name: `${RLS_TOKEN} Hidden Co`, createdAt: '2019-06-15T12:00:00.000Z' },
];

const VIEWER_TIME_ZONE = 'Pacific/Kiritimati';
const CREATOR_TIME_ZONE = 'Pacific/Pago_Pago';
const startOfLastMonthForViewer = Temporal.Now.zonedDateTimeISO(
  VIEWER_TIME_ZONE,
)
  .with({ day: 1 })
  .startOfDay()
  .subtract({ months: 1 });

const RELATIVE_COMPANIES = [
  {
    name: `${RELATIVE_TOKEN} first hour of last month for the viewer`,
    createdAt: startOfLastMonthForViewer
      .add({ hours: 1 })
      .toInstant()
      .toString(),
  },
  {
    name: `${RELATIVE_TOKEN} last hour before last month for the viewer`,
    createdAt: startOfLastMonthForViewer
      .subtract({ hours: 1 })
      .toInstant()
      .toString(),
  },
];

type ChartDataInput = {
  configuration: Record<string, unknown>;
  dashboardFilterValues?: unknown;
  viewerTimeZone?: string;
};

describe('Chart data with dashboard filters (e2e)', () => {
  let fieldIds: DashboardFilterBindingFieldIds;
  let rlsRole: CompanyNameRlsRoleSetup | undefined;

  const queryChartData = ({
    queryName,
    inputTypeName,
    selection,
    input,
    accessToken = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: {
    queryName: string;
    inputTypeName: string;
    selection: string;
    input: ChartDataInput;
    accessToken?: string;
  }) =>
    request(`http://localhost:${APP_PORT}`)
      .post('/metadata')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        query: `query ChartData($input: ${inputTypeName}!) { ${queryName}(input: $input) { ${selection} } }`,
        variables: {
          input: {
            objectMetadataId: fieldIds.companyObjectMetadataId,
            ...input,
          },
        },
      });

  const nameContains = (token: string) => ({
    recordFilters: [
      {
        id: uuidv4(),
        fieldMetadataId: fieldIds.companyNameFieldId,
        operand: ViewFilterOperand.CONTAINS,
        value: token,
      },
    ],
  });

  const periodBinding = (fieldMetadataId?: string) => [
    {
      pageLayoutFilterId: PERIOD_FILTER_ID,
      fieldMetadataId: fieldMetadataId ?? fieldIds.companyCreatedAtFieldId,
    },
  ];

  const barChartConfiguration = ({
    filter,
    timezone = WIDGET_TIME_ZONE,
    bindingFieldMetadataId,
    groupByFieldMetadataId = fieldIds.companyNameFieldId,
    dashboardFilterBindings = periodBinding(bindingFieldMetadataId),
  }: {
    filter: object;
    timezone?: string;
    bindingFieldMetadataId?: string;
    groupByFieldMetadataId?: string;
    dashboardFilterBindings?: object[] | null;
  }) => ({
    configurationType: 'BAR_CHART',
    layout: 'VERTICAL',
    aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
    aggregateOperation: 'COUNT',
    primaryAxisGroupByFieldMetadataId: groupByFieldMetadataId,
    primaryAxisOrderBy: 'FIELD_ASC',
    timezone,
    filter,
    dashboardFilterBindings,
  });

  const queryBarChart = (input: ChartDataInput, accessToken?: string) =>
    queryChartData({
      queryName: 'barChartData',
      inputTypeName: 'BarChartDataInput',
      selection: 'data hasTooManyGroups',
      input,
      accessToken,
    });

  const queryBarChartNames = async (
    input: ChartDataInput,
    accessToken?: string,
  ) => {
    const response = await queryBarChart(input, accessToken);

    expect(response.body.errors).toBeUndefined();

    return response.body.data.barChartData.data.map(
      (row: { name: string }) => row.name,
    );
  };

  const expectNamedDashboardFilterError = (response: Response) => {
    expect(response.body.data).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      subCode: 'INVALID_DASHBOARD_FILTER',
    });
  };

  const expectRejectedInput = (response: Response) => {
    expect(response.body.data ?? null).toBeNull();
    expect(response.body.errors).toHaveLength(1);
    expect(response.body.errors[0].extensions.code).toBe('BAD_USER_INPUT');
  };

  const destroyTestCompanies = async () => {
    // Destroys are capped at 100 records per mutation, so the capped set goes in two batches.
    for (const namePrefix of [
      MAIN_TOKEN,
      `${CAP_TOKEN} 0`,
      `${CAP_TOKEN} 1`,
      RELATIVE_TOKEN,
      RLS_TOKEN,
    ]) {
      const response = await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id',
          filter: { name: { like: `${namePrefix}%` } },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }
  };

  beforeAll(async () => {
    fieldIds = await fetchDashboardFilterBindingFieldIds();

    await destroyTestCompanies();

    const companies = [
      ...MAIN_COMPANIES,
      ...CAPPED_COMPANIES,
      ...RELATIVE_COMPANIES,
      ...RLS_COMPANIES,
    ];

    for (let index = 0; index < companies.length; index += 50) {
      const response = await makeGraphqlApiRequest(
        createManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id',
          data: companies.slice(index, index + 50),
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }
  });

  afterAll(async () => {
    await cleanupCompanyNameRlsRole(rlsRole);
    await destroyTestCompanies();
  });

  it('should equal the same condition written as a widget filter when the viewer is in the widget time zone', async () => {
    const withDashboardFilter = await queryBarChartNames({
      configuration: barChartConfiguration({
        filter: nameContains(MAIN_TOKEN),
      }),
      dashboardFilterValues: MARCH_2019,
      viewerTimeZone: WIDGET_TIME_ZONE,
    });

    const withWidgetFilter = await queryBarChartNames({
      configuration: barChartConfiguration({
        filter: {
          recordFilters: [
            ...nameContains(MAIN_TOKEN).recordFilters,
            {
              id: uuidv4(),
              fieldMetadataId: fieldIds.companyCreatedAtFieldId,
              operand: ViewFilterOperand.IS_AFTER,
              value: '2019-02-28T23:00:00Z',
            },
            {
              id: uuidv4(),
              fieldMetadataId: fieldIds.companyCreatedAtFieldId,
              operand: ViewFilterOperand.IS_BEFORE,
              value: '2019-03-31T22:00:00Z',
            },
          ],
        },
      }),
    });

    expect(withDashboardFilter).toEqual(MAIN_COMPANY_NAMES_IN_MARCH_IN_PARIS);
    expect(withDashboardFilter).toEqual(withWidgetFilter);
  });

  it('should accept an empty list of dashboard filter values without a viewer time zone', async () => {
    const configuration = barChartConfiguration({
      filter: nameContains(MAIN_TOKEN),
    });

    expect(
      await queryBarChartNames({ configuration, dashboardFilterValues: [] }),
    ).toEqual(await queryBarChartNames({ configuration }));
  });

  it('should apply IS on a day the same way as the widget filter', async () => {
    const isMarch10 = { operand: ViewFilterOperand.IS, value: '2019-03-10' };

    const withDashboardFilter = await queryBarChartNames({
      configuration: barChartConfiguration({
        filter: nameContains(MAIN_TOKEN),
      }),
      dashboardFilterValues: periodValues([isMarch10]),
      viewerTimeZone: WIDGET_TIME_ZONE,
    });

    const withWidgetFilter = await queryBarChartNames({
      configuration: barChartConfiguration({
        filter: {
          recordFilters: [
            ...nameContains(MAIN_TOKEN).recordFilters,
            {
              id: uuidv4(),
              fieldMetadataId: fieldIds.companyCreatedAtFieldId,
              ...isMarch10,
            },
          ],
        },
      }),
    });

    expect(withDashboardFilter).toEqual([`${MAIN_TOKEN} 2019-03-10`]);
    expect(withDashboardFilter).toEqual(withWidgetFilter);
  });

  it('should apply the bar cap after the dashboard filter', async () => {
    const configuration = barChartConfiguration({
      filter: nameContains(CAP_TOKEN),
    });

    const unfiltered = await queryBarChart({ configuration });
    const filtered = await queryBarChart({
      configuration,
      dashboardFilterValues: periodValues([
        { operand: ViewFilterOperand.IS_AFTER, value: '2019-05-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2019-06-01' },
      ]),
      viewerTimeZone: WIDGET_TIME_ZONE,
    });

    expect(unfiltered.body.errors).toBeUndefined();
    expect(unfiltered.body.data.barChartData.hasTooManyGroups).toBe(true);
    expect(filtered.body.errors).toBeUndefined();
    expect(filtered.body.data.barChartData).toMatchObject({
      hasTooManyGroups: false,
      data: expect.any(Array),
    });
    expect(filtered.body.data.barChartData.data).toHaveLength(
      CAPPED_COMPANIES_IN_MAY,
    );
  });

  it('should apply the dashboard filter to line charts', async () => {
    const response = await queryChartData({
      queryName: 'lineChartData',
      inputTypeName: 'LineChartDataInput',
      selection: 'series { data { x y } }',
      input: {
        configuration: {
          configurationType: 'LINE_CHART',
          aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
          aggregateOperation: 'COUNT',
          primaryAxisGroupByFieldMetadataId: fieldIds.companyNameFieldId,
          primaryAxisOrderBy: 'FIELD_ASC',
          timezone: WIDGET_TIME_ZONE,
          filter: nameContains(MAIN_TOKEN),
          dashboardFilterBindings: periodBinding(),
        },
        dashboardFilterValues: MARCH_2019,
        viewerTimeZone: WIDGET_TIME_ZONE,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.lineChartData.series.flatMap(
        ({ data }: { data: { x: string }[] }) => data.map(({ x }) => x),
      ),
    ).toEqual(MAIN_COMPANY_NAMES_IN_MARCH_IN_PARIS);
  });

  it('should apply the dashboard filter to pie charts', async () => {
    const response = await queryChartData({
      queryName: 'pieChartData',
      inputTypeName: 'PieChartDataInput',
      selection: 'data { key value }',
      input: {
        configuration: {
          configurationType: 'PIE_CHART',
          aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
          aggregateOperation: 'COUNT',
          groupByFieldMetadataId: fieldIds.companyNameFieldId,
          orderBy: 'FIELD_ASC',
          timezone: WIDGET_TIME_ZONE,
          filter: nameContains(MAIN_TOKEN),
          dashboardFilterBindings: periodBinding(),
        },
        dashboardFilterValues: MARCH_2019,
        viewerTimeZone: WIDGET_TIME_ZONE,
      },
    });

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.pieChartData.data.map(
        ({ key }: { key: string }) => key,
      ),
    ).toEqual(MAIN_COMPANY_NAMES_IN_MARCH_IN_PARIS);
  });

  it('should leave the chart unfiltered when the filter is not applied to it', async () => {
    const notAppliedNames = await queryBarChartNames({
      configuration: barChartConfiguration({
        filter: nameContains(MAIN_TOKEN),
        dashboardFilterBindings: [
          { pageLayoutFilterId: PERIOD_FILTER_ID, fieldMetadataId: null },
        ],
      }),
      dashboardFilterValues: MARCH_2019,
      viewerTimeZone: WIDGET_TIME_ZONE,
    });

    expect(notAppliedNames).toHaveLength(MAIN_COMPANIES.length);
  });

  describe('on a chart without binding', () => {
    const queryMainCompaniesInMarch2019 = (
      configuration: Parameters<typeof barChartConfiguration>[0],
    ) =>
      queryBarChart({
        configuration: barChartConfiguration(configuration),
        dashboardFilterValues: MARCH_2019,
        viewerTimeZone: WIDGET_TIME_ZONE,
      });

    it('should filter on createdAt when it neither groups by nor filters on a date', async () => {
      expect(
        await queryBarChartNames({
          configuration: barChartConfiguration({
            filter: nameContains(MAIN_TOKEN),
            dashboardFilterBindings: null,
          }),
          dashboardFilterValues: MARCH_2019,
          viewerTimeZone: WIDGET_TIME_ZONE,
        }),
      ).toEqual(MAIN_COMPANY_NAMES_IN_MARCH_IN_PARIS);
    });

    it('should filter on the date it groups by', async () => {
      const response = await queryMainCompaniesInMarch2019({
        filter: nameContains(MAIN_TOKEN),
        groupByFieldMetadataId: fieldIds.companyUpdatedAtFieldId,
        dashboardFilterBindings: null,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.barChartData.data).toEqual([]);
    });

    it('should filter on the date it filters on when it groups by no date', async () => {
      const response = await queryMainCompaniesInMarch2019({
        filter: {
          recordFilters: [
            ...nameContains(MAIN_TOKEN).recordFilters,
            {
              id: uuidv4(),
              fieldMetadataId: fieldIds.companyUpdatedAtFieldId,
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          ],
        },
        dashboardFilterBindings: null,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.barChartData.data).toEqual([]);
    });

    it('should let an override win over the date it groups by', async () => {
      const response = await queryMainCompaniesInMarch2019({
        filter: nameContains(MAIN_TOKEN),
        groupByFieldMetadataId: fieldIds.companyUpdatedAtFieldId,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.barChartData.data).not.toEqual([]);
    });
  });

  it('should resolve "last month" in the viewer time zone, not the widget creator one', async () => {
    const names = await queryBarChartNames({
      configuration: barChartConfiguration({
        filter: nameContains(RELATIVE_TOKEN),
        timezone: CREATOR_TIME_ZONE,
      }),
      dashboardFilterValues: periodValues([
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: `PAST_1_MONTH;;${CREATOR_TIME_ZONE};;`,
        },
      ]),
      viewerTimeZone: VIEWER_TIME_ZONE,
    });

    expect(names).toEqual([
      `${RELATIVE_TOKEN} first hour of last month for the viewer`,
    ]);
  });

  it.each<{
    title: string;
    bindingFieldMetadataId?: () => string;
    conditions: Condition[];
    viewerTimeZone?: string;
  }>([
    {
      title: 'a draft binding to a field of another object',
      bindingFieldMetadataId: () => fieldIds.personCreatedAtFieldId,
      conditions: MARCH_2019[0].conditions,
    },
    {
      title: 'a binding to deletedAt, which would count soft-deleted records',
      bindingFieldMetadataId: () => fieldIds.companyDeletedAtFieldId,
      conditions: [{ operand: ViewFilterOperand.IS_NOT_EMPTY, value: '' }],
    },
    {
      title: 'a disallowed operand',
      conditions: [{ operand: ViewFilterOperand.CONTAINS, value: '2019' }],
    },
    {
      title: 'a relative date too far away for Temporal',
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_999999_YEAR' },
      ],
    },
    {
      title: 'a relative date in units shorter than a day',
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1000_SECOND' },
      ],
    },
    {
      title: 'a date out of range in the viewer time zone',
      conditions: [{ operand: ViewFilterOperand.IS, value: '9999-12-31' }],
      viewerTimeZone: 'America/Los_Angeles',
    },
    {
      title: 'a date with a time',
      conditions: [
        { operand: ViewFilterOperand.IS_AFTER, value: '2019-03-01T10:00' },
      ],
    },
  ])(
    'should reject $title with the named error',
    async ({ bindingFieldMetadataId, conditions, viewerTimeZone }) => {
      expectNamedDashboardFilterError(
        await queryBarChart({
          configuration: barChartConfiguration({
            filter: nameContains(MAIN_TOKEN),
            bindingFieldMetadataId: bindingFieldMetadataId?.(),
          }),
          dashboardFilterValues: periodValues(conditions),
          viewerTimeZone: viewerTimeZone ?? WIDGET_TIME_ZONE,
        }),
      );
    },
  );

  it.each<{
    title: string;
    dashboardFilterValues: unknown;
    viewerTimeZone?: string;
  }>([
    { title: 'values that are a string', dashboardFilterValues: 'last month' },
    {
      title: 'conditions that are not objects',
      dashboardFilterValues: [
        {
          pageLayoutFilterId: PERIOD_FILTER_ID,
          type: 'DATE',
          conditions: 'IS',
        },
      ],
    },
    { title: 'values without a time zone', dashboardFilterValues: MARCH_2019 },
    {
      title: 'an invalid time zone',
      dashboardFilterValues: MARCH_2019,
      viewerTimeZone: 'Mars/Base',
    },
    {
      title: 'two values for the same filter',
      dashboardFilterValues: [...MARCH_2019, ...MARCH_2019],
      viewerTimeZone: WIDGET_TIME_ZONE,
    },
    {
      title: 'a value without conditions',
      dashboardFilterValues: periodValues([]),
      viewerTimeZone: WIDGET_TIME_ZONE,
    },
  ])(
    'should reject $title as invalid input instead of an empty chart',
    async ({ dashboardFilterValues, viewerTimeZone }) => {
      expectRejectedInput(
        await queryBarChart({
          configuration: barChartConfiguration({
            filter: nameContains(MAIN_TOKEN),
          }),
          dashboardFilterValues,
          viewerTimeZone,
        }),
      );
    },
  );

  describe("replacing the widget's own period on the same date", () => {
    const createdAtCondition = (
      operand: ViewFilterOperand,
      value: string,
      recordFilterGroupId?: string,
    ) => ({
      id: uuidv4(),
      fieldMetadataId: fieldIds.companyCreatedAtFieldId,
      operand,
      value,
      recordFilterGroupId,
    });

    const queryInMarch2019 = (filter: object) =>
      queryBarChartNames({
        configuration: barChartConfiguration({ filter }),
        dashboardFilterValues: MARCH_2019,
        viewerTimeZone: WIDGET_TIME_ZONE,
      });

    const withMainCompanies = (...recordFilters: object[]) => ({
      recordFilters: [
        ...nameContains(MAIN_TOKEN).recordFilters,
        ...recordFilters,
      ],
    });

    it('should equal the Date range alone when the widget has a period on the field', async () => {
      const withReplacedDay = await queryInMarch2019(
        withMainCompanies(
          createdAtCondition(ViewFilterOperand.IS, '2019-04-05'),
        ),
      );

      expect(withReplacedDay).toEqual(MAIN_COMPANY_NAMES_IN_MARCH_IN_PARIS);
      expect(withReplacedDay).toEqual(
        await queryInMarch2019(nameContains(MAIN_TOKEN)),
      );
    });

    it('should equal the Date range alone when the period was the only condition of the root AND group', async () => {
      expect(
        await queryInMarch2019({
          recordFilters: [
            ...nameContains(MAIN_TOKEN).recordFilters,
            createdAtCondition(ViewFilterOperand.IS, '2019-04-05', 'root'),
          ],
          recordFilterGroups: [
            {
              id: 'root',
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
            },
          ],
        }),
      ).toEqual(MAIN_COMPANY_NAMES_IN_MARCH_IN_PARIS);
    });

    it('should replace an after + before pair like a period', async () => {
      expect(
        await queryInMarch2019(
          withMainCompanies(
            createdAtCondition(
              ViewFilterOperand.IS_AFTER,
              '2019-04-02T00:00:00Z',
            ),
            createdAtCondition(
              ViewFilterOperand.IS_BEFORE,
              '2019-04-10T00:00:00Z',
            ),
          ),
        ),
      ).toEqual(MAIN_COMPANY_NAMES_IN_MARCH_IN_PARIS);
    });

    it('should keep a condition on the field that is not a period', async () => {
      expect(
        await queryInMarch2019(
          withMainCompanies(
            createdAtCondition(
              ViewFilterOperand.IS_BEFORE,
              '2019-03-05T00:00:00Z',
            ),
          ),
        ),
      ).toEqual([`${MAIN_TOKEN} 2019-03-01 in Paris`]);
    });

    it('should keep a period inside a nested group', async () => {
      expect(
        await queryInMarch2019({
          ...withMainCompanies(
            createdAtCondition(ViewFilterOperand.IS, '2019-04-05', 'nested'),
          ),
          recordFilterGroups: [
            {
              id: 'root',
              logicalOperator: RecordFilterGroupLogicalOperator.AND,
            },
            {
              id: 'nested',
              logicalOperator: RecordFilterGroupLogicalOperator.OR,
              parentRecordFilterGroupId: 'root',
            },
          ],
        }),
      ).toEqual([]);
    });

    it('should keep a period under a root OR group', async () => {
      expect(
        await queryInMarch2019({
          recordFilters: [
            ...nameContains(MAIN_TOKEN).recordFilters,
            createdAtCondition(ViewFilterOperand.IS, '2019-03-10', 'root'),
            {
              id: uuidv4(),
              fieldMetadataId: fieldIds.companyNameFieldId,
              operand: ViewFilterOperand.CONTAINS,
              value: 'No company has this name',
              recordFilterGroupId: 'root',
            },
          ],
          recordFilterGroups: [
            {
              id: 'root',
              logicalOperator: RecordFilterGroupLogicalOperator.OR,
            },
          ],
        }),
      ).toEqual([`${MAIN_TOKEN} 2019-03-10`]);
    });
  });

  describe('as a viewer under row-level security', () => {
    beforeAll(async () => {
      rlsRole = await setupCompanyNameRlsRole({
        label: 'Dashboard Filter Chart RLS Role',
        description: 'Role for testing dashboard filters under RLS',
      });
    });

    it('should not count more rows with a dashboard filter than without', async () => {
      const configuration = barChartConfiguration({
        filter: nameContains(RLS_TOKEN),
      });
      const june2019 = {
        dashboardFilterValues: periodValues([
          { operand: ViewFilterOperand.IS_AFTER, value: '2019-06-01' },
          { operand: ViewFilterOperand.IS_BEFORE, value: '2019-07-01' },
        ]),
        viewerTimeZone: WIDGET_TIME_ZONE,
      };

      const restrictedWithFilter = await queryBarChartNames(
        { configuration, ...june2019 },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      const restrictedWithoutFilter = await queryBarChartNames(
        { configuration },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );
      const adminWithFilter = await queryBarChartNames({
        configuration,
        ...june2019,
      });

      expect(adminWithFilter).toHaveLength(RLS_COMPANIES.length);
      expect(restrictedWithFilter).toEqual([
        `${RLS_TOKEN} ${VISIBLE_COMPANY_NAME_TOKEN} Co`,
      ]);
      expect(restrictedWithoutFilter).toEqual(restrictedWithFilter);
    });
  });
});
