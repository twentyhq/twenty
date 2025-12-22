import { registerEnumType } from '@nestjs/graphql';

import { type Expect } from 'twenty-shared/testing';

import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';

export enum WidgetConfigurationType {
  AGGREGATE_CHART = GraphType.AGGREGATE_CHART,
  GAUGE_CHART = GraphType.GAUGE_CHART,
  PIE_CHART = GraphType.PIE_CHART,
  BAR_CHART = GraphType.BAR_CHART,
  LINE_CHART = GraphType.LINE_CHART,
  IFRAME = 'IFRAME',
  STANDALONE_RICH_TEXT = 'STANDALONE_RICH_TEXT',
  VIEW = 'VIEW',
  FIELD = 'FIELD',
  FIELDS = 'FIELDS',
  TIMELINE = 'TIMELINE',
  TASKS = 'TASKS',
  NOTES = 'NOTES',
  FILES = 'FILES',
  EMAILS = 'EMAILS',
  CALENDAR = 'CALENDAR',
  FIELD_RICH_TEXT = 'FIELD_RICH_TEXT',
  WORKFLOW = 'WORKFLOW',
  WORKFLOW_VERSION = 'WORKFLOW_VERSION',
  WORKFLOW_RUN = 'WORKFLOW_RUN',
}

registerEnumType(WidgetConfigurationType, {
  name: 'WidgetConfigurationType',
});

// eslint-disable-next-line unused-imports/no-unused-vars
type Assertion = Expect<
  `${GraphType}` extends `${WidgetConfigurationType}` ? true : false
>;
