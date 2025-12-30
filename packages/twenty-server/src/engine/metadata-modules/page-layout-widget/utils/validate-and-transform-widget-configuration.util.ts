import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { transformRichTextV2Value } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util';
import { AggregateChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/aggregate-chart-configuration.dto';
import { BarChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/pie-chart-configuration.dto';
import { StandaloneRichTextConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/standalone-rich-text-configuration.dto';
import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

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
}): AllPageLayoutWidgetConfiguration | null => {
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
      const instance = plainToInstance(BarChartConfigurationDTO, configuration);

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
        LineChartConfigurationDTO,
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
      const instance = plainToInstance(PieChartConfigurationDTO, configuration);

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
        AggregateChartConfigurationDTO,
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
        GaugeChartConfigurationDTO,
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
): AllPageLayoutWidgetConfiguration | null => {
  const instance = plainToInstance(IframeConfigurationDTO, configuration);

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
): Promise<AllPageLayoutWidgetConfiguration | null> => {
  const instance = plainToInstance(
    StandaloneRichTextConfigurationDTO,
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
}): Promise<AllPageLayoutWidgetConfiguration | null> => {
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
