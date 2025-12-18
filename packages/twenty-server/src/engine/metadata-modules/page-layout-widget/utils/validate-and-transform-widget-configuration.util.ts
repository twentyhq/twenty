import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { transformRichTextV2Value } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllWidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/types/all-widget-configuration-type.type';
import { AggregateChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/aggregate-chart-configuration.validator';
import { BarChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/bar-chart-configuration.validator';
import { GaugeChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/gauge-chart-configuration.validator';
import { IframeConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/iframe-configuration.validator';
import { LineChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/line-chart-configuration.validator';
import { PieChartConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/pie-chart-configuration.validator';
import { StandaloneRichTextConfigurationValidator } from 'src/engine/metadata-modules/page-layout-widget/validators/standalone-rich-text-configuration.validator';

const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors
    .map((err) => {
      const constraints = err.constraints
        ? Object.values(err.constraints).join(', ')
        : 'Unknown error';

      return `${err.property}: ${constraints}`;
    })
    .join('; ');
};

const validateGraphConfiguration = ({
  configuration,
  isDashboardV2Enabled,
}: {
  configuration: Record<string, unknown>;
  isDashboardV2Enabled: boolean;
}): AllWidgetConfigurationType | null => {
  const configurationType = configuration.configurationType as GraphType;

  if (
    !configurationType ||
    !Object.values(GraphType).includes(configurationType)
  ) {
    return null;
  }

  if (configurationType === GraphType.GAUGE_CHART && !isDashboardV2Enabled) {
    throw new Error(
      `Chart type ${configurationType} requires IS_DASHBOARD_V2_ENABLED feature flag`,
    );
  }

  switch (configurationType) {
    case GraphType.BAR_CHART: {
      const instance = plainToInstance(
        BarChartConfigurationValidator,
        configuration,
      );

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      if (
        isDefined(instance.secondaryAxisGroupByFieldMetadataId) &&
        !isDefined(instance.groupMode)
      ) {
        instance.groupMode = BarChartGroupMode.STACKED;
      }

      return instance;
    }
    case GraphType.LINE_CHART: {
      const instance = plainToInstance(
        LineChartConfigurationValidator,
        configuration,
      );

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      if (
        isDefined(instance.secondaryAxisGroupByFieldMetadataId) &&
        !isDefined(instance.isStacked)
      ) {
        instance.isStacked = true;
      }

      return instance;
    }
    case GraphType.PIE_CHART: {
      const instance = plainToInstance(
        PieChartConfigurationValidator,
        configuration,
      );

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      return instance;
    }
    case GraphType.AGGREGATE_CHART: {
      const instance = plainToInstance(
        AggregateChartConfigurationValidator,
        configuration,
      );

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      return instance;
    }
    case GraphType.GAUGE_CHART: {
      const instance = plainToInstance(
        GaugeChartConfigurationValidator,
        configuration,
      );

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      return instance;
    }
    default:
      return null;
  }
};

const validateIframeConfiguration = (
  configuration: unknown,
): AllWidgetConfigurationType | null => {
  const instance = plainToInstance(IframeConfigurationValidator, configuration);

  const errors = validateSync(instance, {
    whitelist: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw errors;
  }

  return instance;
};

const validateStandaloneRichTextConfiguration = async (
  configuration: unknown,
): Promise<AllWidgetConfigurationType | null> => {
  const instance = plainToInstance(
    StandaloneRichTextConfigurationValidator,
    configuration,
  );

  const errors = validateSync(instance, {
    whitelist: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw errors;
  }

  if (instance.body) {
    instance.body = await transformRichTextV2Value(instance.body);
  }

  return instance;
};

export const validateAndTransformWidgetConfiguration = async ({
  type,
  configuration,
  isDashboardV2Enabled,
}: {
  type: WidgetType;
  configuration: unknown;
  isDashboardV2Enabled: boolean;
}): Promise<AllWidgetConfigurationType | null> => {
  if (!configuration || typeof configuration !== 'object') {
    throw new Error('Invalid configuration: not an object');
  }

  try {
    switch (type) {
      case WidgetType.GRAPH:
        return validateGraphConfiguration({
          configuration: configuration as Record<string, unknown>,
          isDashboardV2Enabled,
        });
      case WidgetType.IFRAME:
        return validateIframeConfiguration(configuration);
      case WidgetType.STANDALONE_RICH_TEXT:
        return await validateStandaloneRichTextConfiguration(configuration);
      default:
        return null;
    }
  } catch (error) {
    if (Array.isArray(error)) {
      const errorMessage = formatValidationErrors(error);

      throw new Error(errorMessage);
    }
    throw error;
  }
};
