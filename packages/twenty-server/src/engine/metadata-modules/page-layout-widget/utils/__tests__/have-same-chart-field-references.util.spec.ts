import { AggregateOperations, ViewFilterOperand } from 'twenty-shared/types';

import { type BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { haveSameChartFieldReferences } from 'src/engine/metadata-modules/page-layout-widget/utils/have-same-chart-field-references.util';

const storedBarChartConfiguration: BarChartConfigurationDTO = {
  configurationType: WidgetConfigurationType.BAR_CHART,
  aggregateFieldMetadataId: 'amount-id',
  aggregateOperation: AggregateOperations.SUM,
  primaryAxisGroupByFieldMetadataId: 'stage-id',
  secondaryAxisGroupByFieldMetadataId: 'company-id',
  secondaryAxisGroupBySubFieldName: 'name',
  layout: BarChartLayout.VERTICAL,
  filter: {
    recordFilters: [
      {
        fieldMetadataId: 'stage-id',
        operand: ViewFilterOperand.IS,
        value: 'NEW',
      },
    ],
  },
};

describe('haveSameChartFieldReferences', () => {
  it('should ignore properties the field reference validation does not read', () => {
    // Shape echoed back by the front end: __typename, explicit nulls and
    // defaults resolved by the GraphQL output types, none of which the DTO models
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
    } as unknown as BarChartConfigurationDTO;

    expect(
      haveSameChartFieldReferences({
        configuration: storedBarChartConfiguration,
        otherConfiguration: barChartConfigurationSentByClient,
      }),
    ).toBe(true);
  });

  it('should detect a changed aggregate field', () => {
    expect(
      haveSameChartFieldReferences({
        configuration: storedBarChartConfiguration,
        otherConfiguration: {
          ...storedBarChartConfiguration,
          aggregateFieldMetadataId: 'other-field-id',
        },
      }),
    ).toBe(false);
  });

  it('should detect a changed group by sub field', () => {
    expect(
      haveSameChartFieldReferences({
        configuration: storedBarChartConfiguration,
        otherConfiguration: {
          ...storedBarChartConfiguration,
          secondaryAxisGroupBySubFieldName: 'domainName',
        },
      }),
    ).toBe(false);
  });

  it('should detect a changed filter value', () => {
    expect(
      haveSameChartFieldReferences({
        configuration: storedBarChartConfiguration,
        otherConfiguration: {
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
        },
      }),
    ).toBe(false);
  });

  it('should detect a changed configuration type', () => {
    expect(
      haveSameChartFieldReferences({
        configuration: storedBarChartConfiguration,
        otherConfiguration: {
          configurationType: WidgetConfigurationType.PIE_CHART,
          aggregateFieldMetadataId: 'amount-id',
          aggregateOperation: AggregateOperations.SUM,
          groupByFieldMetadataId: 'stage-id',
        },
      }),
    ).toBe(false);
  });
});
