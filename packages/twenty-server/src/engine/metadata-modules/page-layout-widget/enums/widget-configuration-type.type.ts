import { registerEnumType } from '@nestjs/graphql';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { Expect } from 'twenty-shared/testing';

export enum WidgetConfigurationType {
  AGGREGATE_CHART = GraphType.AGGREGATE_CHART,
  GAUGE_CHART = GraphType.GAUGE_CHART,
  PIE_CHART = GraphType.PIE_CHART,
  BAR_CHART = GraphType.BAR_CHART,
  LINE_CHART = GraphType.LINE_CHART,
  IFRAME = 'IFRAME',
  STANDALONE_RICH_TEXT = 'STANDALONE_RICH_TEXT',
}

registerEnumType(WidgetConfigurationType, {
  name: 'WidgetConfigurationType',
});

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertion = Expect<
  `${GraphType}` extends `${WidgetConfigurationType}` ? true : false
>;
