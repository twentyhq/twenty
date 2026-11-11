import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { sanitizeWidgetConfigurationByDto } from 'src/engine/metadata-modules/page-layout-widget/utils/sanitize-widget-configuration-by-dto.util';

describe('sanitizeWidgetConfigurationByDto', () => {
  it('should clean a configuration that fails validation and report its errors', () => {
    const { sanitizedConfiguration, errors } = sanitizeWidgetConfigurationByDto(
      {
        DtoClass: AggregateChartConfigurationDTO,
        configuration: {
          configurationType: WidgetConfigurationType.AGGREGATE_CHART,
          aggregateFieldMetadataId: '',
          __typename: 'AggregateChartConfiguration',
          suffix: null,
          axisNameDisplay: 'NONE',
        },
      },
    );

    expect(sanitizedConfiguration).toEqual({
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateFieldMetadataId: '',
    });
    expect(errors.map((error) => error.property)).toEqual([
      'aggregateFieldMetadataId',
      'aggregateOperation',
    ]);
  });
});
