import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  type DashboardFilterBindingFieldIds,
  fetchDashboardFilterBindingFieldIds,
} from 'test/integration/metadata/suites/page-layout/utils/fetch-dashboard-filter-binding-field-ids.util';
import request from 'supertest';
import { Temporal } from 'temporal-polyfill';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';
import { ViewFilterOperand } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const ABSOLUTE_TOKEN = 'ChartTimeZoneAbsolute';
const RELATIVE_TOKEN = 'ChartTimeZoneRelative';
const DST_TOKEN = 'ChartTimeZoneDst';
const CUT_TOKEN = 'ChartTimeZoneCut';

const ABSOLUTE_COMPANIES = [
  {
    name: `${ABSOLUTE_TOKEN} July 10 in UTC, July 11 in Paris`,
    createdAt: '2019-07-10T23:30:00.000Z',
  },
  {
    name: `${ABSOLUTE_TOKEN} July 12`,
    createdAt: '2019-07-12T12:00:00.000Z',
  },
];

// Los Angeles moved to daylight time on 2019-03-10
const DST_COMPANIES = [
  {
    name: `${DST_TOKEN} March 9, 23:30 in Los Angeles`,
    createdAt: '2019-03-10T07:30:00.000Z',
  },
  {
    name: `${DST_TOKEN} March 10, 23:30 in Los Angeles`,
    createdAt: '2019-03-11T06:30:00.000Z',
  },
];

const buildRelativeCompanies = (today: Temporal.PlainDate) =>
  [10, 5].map((daysAgo) => ({
    name: `${RELATIVE_TOKEN} ${daysAgo} days ago`,
    createdAt: today
      .subtract({ days: daysAgo })
      .toZonedDateTime({ timeZone: 'UTC', plainTime: '12:00' })
      .toInstant()
      .toString(),
  }));

type Condition = { operand: ViewFilterOperand; value: string };

const dateRangeValues = (conditions: Condition[]) => [
  {
    pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
    type: 'DATE',
    conditions,
  },
];

type ChartDataInput = {
  configuration: Record<string, unknown>;
  dashboardFilterValues?: unknown;
  viewerTimeZone?: string;
};

type ChartDataPayload = {
  data: Record<string, string | number>[];
  indexBy: string;
  keys: string[];
  formattedToRawLookup: Record<string, string>;
};

describe('Chart data buckets in the viewer time zone (e2e)', () => {
  let fieldIds: DashboardFilterBindingFieldIds;

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

  const dailyChartConfiguration = ({
    configurationType,
    token,
    timezone = 'UTC',
    granularity = 'DAY',
  }: {
    configurationType: 'BAR_CHART' | 'LINE_CHART';
    token: string;
    timezone?: string;
    granularity?: string;
  }) => ({
    configurationType,
    ...(configurationType === 'BAR_CHART' ? { layout: 'VERTICAL' } : {}),
    aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
    aggregateOperation: 'COUNT',
    primaryAxisGroupByFieldMetadataId: fieldIds.companyCreatedAtFieldId,
    primaryAxisDateGranularity: granularity,
    primaryAxisOrderBy: 'FIELD_ASC',
    timezone,
    filter: nameContains(token),
  });

  const queryBarChart = (input: ChartDataInput) =>
    request(`http://localhost:${APP_PORT}`)
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({
        query: `query BarChartData($input: BarChartDataInput!) { barChartData(input: $input) { data indexBy keys formattedToRawLookup hasTooManyGroups } }`,
        variables: {
          input: {
            objectMetadataId: fieldIds.companyObjectMetadataId,
            ...input,
          },
        },
      });

  const queryBarChartBuckets = async (
    input: Omit<ChartDataInput, 'configuration'> & {
      token: string;
      granularity?: string;
    },
  ) => {
    const { token, granularity, ...chartDataInput } = input;
    const response = await queryBarChart({
      configuration: dailyChartConfiguration({
        configurationType: 'BAR_CHART',
        token,
        granularity,
      }),
      ...chartDataInput,
    });

    expect(response.body.errors).toBeUndefined();

    const { data, indexBy, keys, formattedToRawLookup }: ChartDataPayload =
      response.body.data.barChartData;

    return data.map((row) => [
      formattedToRawLookup[row[indexBy]],
      row[keys[0]],
    ]);
  };

  const destroyTestCompanies = async () => {
    for (const token of [
      ABSOLUTE_TOKEN,
      RELATIVE_TOKEN,
      DST_TOKEN,
      CUT_TOKEN,
    ]) {
      const response = await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id',
          filter: { name: { like: `${token}%` } },
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }
  };

  const createCompanies = async (
    data: { name: string; createdAt: string }[],
  ) => {
    const response = await makeGraphqlApiRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data,
      }),
    );

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    fieldIds = await fetchDashboardFilterBindingFieldIds();

    await destroyTestCompanies();
    await createCompanies([...ABSOLUTE_COMPANIES, ...DST_COMPANIES]);
  });

  afterAll(async () => {
    await destroyTestCompanies();
  });

  it('should bucket a record created around midnight on the day of the viewer', async () => {
    expect(
      await queryBarChartBuckets({
        token: ABSOLUTE_TOKEN,
        viewerTimeZone: 'UTC',
      }),
    ).toEqual([
      ['2019-07-10', 1],
      ['2019-07-11', 0],
      ['2019-07-12', 1],
    ]);
    expect(
      await queryBarChartBuckets({
        token: ABSOLUTE_TOKEN,
        viewerTimeZone: 'Europe/Paris',
      }),
    ).toEqual([
      ['2019-07-11', 1],
      ['2019-07-12', 1],
    ]);
  });

  it('should bucket in the widget time zone when no viewer time zone is sent, as before', async () => {
    for (const timezone of ['UTC', 'Europe/Paris']) {
      const configuration = dailyChartConfiguration({
        configurationType: 'BAR_CHART',
        token: ABSOLUTE_TOKEN,
        timezone,
      });

      const withoutViewerTimeZone = await queryBarChart({ configuration });
      const inWidgetTimeZone = await queryBarChart({
        configuration,
        viewerTimeZone: timezone,
      });

      expect(withoutViewerTimeZone.body.errors).toBeUndefined();
      expect(withoutViewerTimeZone.body).toEqual(inWidgetTimeZone.body);
    }

    const withoutViewerTimeZone = await queryBarChart({
      configuration: dailyChartConfiguration({
        configurationType: 'BAR_CHART',
        token: ABSOLUTE_TOKEN,
        timezone: 'Europe/Paris',
      }),
    });

    expect(
      Object.values(
        withoutViewerTimeZone.body.data.barChartData.formattedToRawLookup,
      ),
    ).toEqual(['2019-07-11', '2019-07-12']);
  });

  it('should extend the date axis to both bounded sides of the dashboard range', async () => {
    expect(
      await queryBarChartBuckets({
        token: ABSOLUTE_TOKEN,
        viewerTimeZone: 'UTC',
        dashboardFilterValues: dateRangeValues([
          { operand: ViewFilterOperand.IS_AFTER, value: '2019-07-08' },
          { operand: ViewFilterOperand.IS_BEFORE, value: '2019-07-15' },
        ]),
      }),
    ).toEqual([
      ['2019-07-08', 0],
      ['2019-07-09', 0],
      ['2019-07-10', 1],
      ['2019-07-11', 0],
      ['2019-07-12', 1],
      ['2019-07-13', 0],
      ['2019-07-14', 0],
    ]);
  });

  it("should keep the data's bound on an open side of the dashboard range", async () => {
    expect(
      await queryBarChartBuckets({
        token: ABSOLUTE_TOKEN,
        viewerTimeZone: 'UTC',
        dashboardFilterValues: dateRangeValues([
          { operand: ViewFilterOperand.IS_AFTER, value: '2019-07-09' },
        ]),
      }),
    ).toEqual([
      ['2019-07-09', 0],
      ['2019-07-10', 1],
      ['2019-07-11', 0],
      ['2019-07-12', 1],
    ]);
  });

  it('should give a past 30 days range leading and trailing empty buckets on a line chart', async () => {
    const queryPastThirtyDays = () =>
      request(`http://localhost:${APP_PORT}`)
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `query LineChartData($input: LineChartDataInput!) { lineChartData(input: $input) { series { data { x y } } formattedToRawLookup } }`,
          variables: {
            input: {
              objectMetadataId: fieldIds.companyObjectMetadataId,
              configuration: dailyChartConfiguration({
                configurationType: 'LINE_CHART',
                token: RELATIVE_TOKEN,
              }),
              dashboardFilterValues: dateRangeValues([
                {
                  operand: ViewFilterOperand.IS_RELATIVE,
                  value: 'PAST_30_DAY',
                },
              ]),
              viewerTimeZone: 'UTC',
            },
          },
        });

    // Seeded and checked within one UTC day, retried once if the run crosses midnight
    for (const attempt of [1, 2]) {
      const today = Temporal.Now.plainDateISO('UTC');

      await createCompanies(buildRelativeCompanies(today));

      const response = await queryPastThirtyDays();

      if (attempt === 1 && !Temporal.Now.plainDateISO('UTC').equals(today)) {
        await destroyTestCompanies();
        await createCompanies([...ABSOLUTE_COMPANIES, ...DST_COMPANIES]);
        continue;
      }

      expect(response.body.errors).toBeUndefined();

      const { series, formattedToRawLookup } = response.body.data.lineChartData;
      const points = series[0].data.map(
        ({ x, y }: { x: string; y: number }) => [formattedToRawLookup[x], y],
      );

      expect(points).toEqual(
        Array.from({ length: 30 }, (_, index) => {
          const daysAgo = 30 - index;

          return [
            today.subtract({ days: daysAgo }).toString(),
            daysAgo === 10 || daysAgo === 5 ? 1 : 0,
          ];
        }),
      );

      return;
    }
  });

  it('should extend a week axis to the weeks of the dashboard range', async () => {
    expect(
      await queryBarChartBuckets({
        token: ABSOLUTE_TOKEN,
        granularity: 'WEEK',
        viewerTimeZone: 'UTC',
        dashboardFilterValues: dateRangeValues([
          { operand: ViewFilterOperand.IS_AFTER, value: '2019-07-01' },
          { operand: ViewFilterOperand.IS_BEFORE, value: '2019-07-22' },
        ]),
      }),
    ).toEqual([
      ['2019-07-01', 0],
      ['2019-07-08', 2],
      ['2019-07-15', 0],
    ]);
  });

  it('should bucket and extend in a zone whose offset changes inside the range', async () => {
    const dashboardFilterValues = dateRangeValues([
      { operand: ViewFilterOperand.IS_AFTER, value: '2019-03-08' },
      { operand: ViewFilterOperand.IS_BEFORE, value: '2019-03-12' },
    ]);

    expect(
      await queryBarChartBuckets({
        token: DST_TOKEN,
        viewerTimeZone: 'America/Los_Angeles',
        dashboardFilterValues,
      }),
    ).toEqual([
      ['2019-03-08', 0],
      ['2019-03-09', 1],
      ['2019-03-10', 1],
      ['2019-03-11', 0],
    ]);
    expect(
      await queryBarChartBuckets({
        token: DST_TOKEN,
        viewerTimeZone: 'UTC',
        dashboardFilterValues,
      }),
    ).toEqual([
      ['2019-03-08', 0],
      ['2019-03-09', 0],
      ['2019-03-10', 1],
      ['2019-03-11', 1],
    ]);
  });

  it('should keep the data bounds when the dashboard range needs more buckets than the cap', async () => {
    expect(
      await queryBarChartBuckets({
        token: ABSOLUTE_TOKEN,
        viewerTimeZone: 'UTC',
        dashboardFilterValues: dateRangeValues([
          { operand: ViewFilterOperand.IS_AFTER, value: '2019-01-01' },
          { operand: ViewFilterOperand.IS_BEFORE, value: '2019-07-15' },
        ]),
      }),
    ).toEqual([
      ['2019-07-10', 1],
      ['2019-07-11', 0],
      ['2019-07-12', 1],
    ]);
  });

  it('should not extend the axis over days a two-dimensional query cut off', async () => {
    const firstDay = Temporal.PlainDate.from('2018-01-01');
    // 60 days × 2 names = 120 groups, over the 101 a non-stacked query returns
    const companies = Array.from({ length: 120 }, (_, index) => ({
      name: `${CUT_TOKEN} ${index % 2 === 0 ? 'A' : 'B'}`,
      createdAt: firstDay
        .add({ days: Math.floor(index / 2) })
        .toZonedDateTime({ timeZone: 'UTC', plainTime: '12:00' })
        .toInstant()
        .toString(),
    }));

    for (let index = 0; index < companies.length; index += 50) {
      await createCompanies(companies.slice(index, index + 50));
    }

    try {
      const response = await queryBarChart({
        configuration: {
          ...dailyChartConfiguration({
            configurationType: 'BAR_CHART',
            token: CUT_TOKEN,
          }),
          secondaryAxisGroupByFieldMetadataId: fieldIds.companyNameFieldId,
        },
        viewerTimeZone: 'UTC',
        dashboardFilterValues: dateRangeValues([
          { operand: ViewFilterOperand.IS_AFTER, value: '2018-01-01' },
          { operand: ViewFilterOperand.IS_BEFORE, value: '2018-03-02' },
        ]),
      });

      expect(response.body.errors).toBeUndefined();

      const { data }: ChartDataPayload = response.body.data.barChartData;
      const hasData = (row: Record<string, string | number>) =>
        Object.values(row).some(
          (value) => typeof value === 'number' && value > 0,
        );

      expect(data.length).toBeLessThan(60);
      expect(hasData(data[data.length - 1])).toBe(true);
    } finally {
      await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: 'company',
          objectMetadataPluralName: 'companies',
          gqlFields: 'id',
          filter: { name: { like: `${CUT_TOKEN}%` } },
        }),
      );
    }
  });

  it('should bucket pie charts in the viewer time zone', async () => {
    const queryPieDays = async (viewerTimeZone?: string) => {
      const response = await request(`http://localhost:${APP_PORT}`)
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({
          query: `query PieChartData($input: PieChartDataInput!) { pieChartData(input: $input) { data { key value } formattedToRawLookup } }`,
          variables: {
            input: {
              objectMetadataId: fieldIds.companyObjectMetadataId,
              configuration: {
                configurationType: 'PIE_CHART',
                aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
                aggregateOperation: 'COUNT',
                groupByFieldMetadataId: fieldIds.companyCreatedAtFieldId,
                dateGranularity: 'DAY',
                orderBy: 'FIELD_ASC',
                timezone: 'UTC',
                filter: nameContains(ABSOLUTE_TOKEN),
              },
              viewerTimeZone,
            },
          },
        });

      expect(response.body.errors).toBeUndefined();

      const { data, formattedToRawLookup } = response.body.data.pieChartData;

      return data.map(({ key }: { key: string }) => formattedToRawLookup[key]);
    };

    expect(await queryPieDays()).toEqual(['2019-07-10', '2019-07-12']);
    expect(await queryPieDays('Europe/Paris')).toEqual([
      '2019-07-11',
      '2019-07-12',
    ]);
  });

  it('should fall back to the widget time zone when the group-by does not know the viewer zone', async () => {
    expect(
      await queryBarChartBuckets({
        token: ABSOLUTE_TOKEN,
        viewerTimeZone: 'America/Ciudad_Juarez',
      }),
    ).toEqual([
      ['2019-07-10', 1],
      ['2019-07-11', 0],
      ['2019-07-12', 1],
    ]);
  });
});
