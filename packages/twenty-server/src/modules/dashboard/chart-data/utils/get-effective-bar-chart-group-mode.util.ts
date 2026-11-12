import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';

// A bar chart with no stored group mode is drawn stacked, so its query must be sized as stacked too
export const getEffectiveBarChartGroupMode = (
  groupMode: BarChartGroupMode | null | undefined,
): BarChartGroupMode => groupMode ?? BarChartGroupMode.STACKED;
