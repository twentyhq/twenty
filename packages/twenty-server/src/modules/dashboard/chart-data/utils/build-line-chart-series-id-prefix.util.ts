import { createHash } from 'crypto';

import type { LineChartConfigurationDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/line-chart-configuration.dto';

export const buildLineChartSeriesIdPrefix = (
  objectMetadataId: string,
  configuration: LineChartConfigurationDTO,
): string => {
  const hash = createHash('sha256')
    .update(objectMetadataId)
    .update(':')
    .update(JSON.stringify(configuration))
    .digest('hex')
    .slice(0, 16);

  return `lc_${hash}:`;
};
