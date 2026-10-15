import { AggregateOperations, ViewFilterOperand } from 'twenty-shared/types';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { haveSameChartFieldReferences } from 'src/engine/metadata-modules/page-layout-widget/utils/have-same-chart-field-references.util';

const storedBarChartConfiguration = {
  configurationType: WidgetConfigurationType.BAR_CHART,
  aggregateFieldMetadataId: 'amount-id',
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: 'stage-id',
  secondaryAxisGroupByFieldMetadataId: 'company-id',
  secondaryAxisGroupBySubFieldName: 'name',
  filter: {
    recordFilters: [
      {
        fieldMetadataId: 'stage-id',
        operand: ViewFilterOperand.IS,
        value: 'NEW',
      },
    ],
  },
} as AllPageLayoutWidgetConfiguration;

// Shape echoed back by the front end: __typename, explicit nulls and
// defaults resolved by the GraphQL output types
const barChartConfigurationSentByClient = {
  ...storedBarChartConfiguration,
  __typename: 'BarChartConfiguration',
  primaryAxisGroupBySubFieldName: null,
  primaryAxisDateGranularity: 'DAY',
  displayLegend: true,
  numberFormat: null,
  filter: {
    __typename: 'ChartFilter',
    recordFilters: [
      {
        __typename: 'ChartRecordFilter',
        id: 'filter-id',
        type: 'SELECT',
        fieldMetadataId: 'stage-id',
        operand: ViewFilterOperand.IS,
        value: 'NEW',
        subFieldName: null,
      },
    ],
    recordFilterGroups: [],
  },
} as unknown as AllPageLayoutWidgetConfiguration;

describe('haveSameChartFieldReferences', () => {
  it('should ignore properties the field reference validation does not read', () => {
    expect(
      haveSameChartFieldReferences(
        storedBarChartConfiguration,
        barChartConfigurationSentByClient,
      ),
    ).toBe(true);
  });

  it('should detect a changed aggregate field', () => {
    expect(
      haveSameChartFieldReferences(storedBarChartConfiguration, {
        ...storedBarChartConfiguration,
        aggregateFieldMetadataId: 'other-field-id',
      } as AllPageLayoutWidgetConfiguration),
    ).toBe(false);
  });

  it('should detect a changed group by sub field', () => {
    expect(
      haveSameChartFieldReferences(storedBarChartConfiguration, {
        ...storedBarChartConfiguration,
        secondaryAxisGroupBySubFieldName: 'domainName',
      } as AllPageLayoutWidgetConfiguration),
    ).toBe(false);
  });

  it('should detect a changed filter value', () => {
    expect(
      haveSameChartFieldReferences(storedBarChartConfiguration, {
        ...storedBarChartConfiguration,
        filter: {
          recordFilters: [
            {
              fieldMetadataId: 'stage-id',
              operand: ViewFilterOperand.IS,
              value: 'WON',
            },
          ],
        },
      } as AllPageLayoutWidgetConfiguration),
    ).toBe(false);
  });

  it('should detect a changed configuration type', () => {
    expect(
      haveSameChartFieldReferences(storedBarChartConfiguration, {
        configurationType: WidgetConfigurationType.PIE_CHART,
        aggregateFieldMetadataId: 'amount-id',
        aggregateOperation: AggregateOperations.SUM,
        groupByFieldMetadataId: 'stage-id',
      } as AllPageLayoutWidgetConfiguration),
    ).toBe(false);
  });

  it('should return false for configurations that are not charts', () => {
    const iframeConfiguration = {
      configurationType: WidgetConfigurationType.IFRAME,
      url: 'https://example.com',
    } as AllPageLayoutWidgetConfiguration;

    expect(
      haveSameChartFieldReferences(iframeConfiguration, iframeConfiguration),
    ).toBe(false);
  });
});
