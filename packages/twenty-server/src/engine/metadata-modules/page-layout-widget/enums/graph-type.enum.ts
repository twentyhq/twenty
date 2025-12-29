import { registerEnumType } from '@nestjs/graphql';

export enum GraphType {
  AGGREGATE_CHART = 'AGGREGATE_CHART',
  GAUGE_CHART = 'GAUGE_CHART',
  PIE_CHART = 'PIE_CHART',
  BAR_CHART = 'BAR_CHART',
  LINE_CHART = 'LINE_CHART',
}

registerEnumType(GraphType, {
  name: 'GraphType',
  description: 'Type of graph widget',
});
