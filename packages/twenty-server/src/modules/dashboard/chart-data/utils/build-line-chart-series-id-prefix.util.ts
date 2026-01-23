import { createHash } from 'crypto';

import type { LineChartConfigurationValidationSchema } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.validation-schema';

export const buildLineChartSeriesIdPrefix = (
  objectMetadataId: string,
  configuration: LineChartConfigurationValidationSchema,
): string => {
  const hash = createHash('sha256')
    .update(objectMetadataId)
    .update(':')
    .update(JSON.stringify(configuration))
    .digest('hex')
    .slice(0, 16);

  return `lc_${hash}:`;
};
