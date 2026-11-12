import { BarChartGroupMode } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-group-mode.enum';
import { getEffectiveBarChartGroupMode } from 'src/modules/dashboard/chart-data/utils/get-effective-bar-chart-group-mode.util';

describe('getEffectiveBarChartGroupMode', () => {
  it.each([undefined, null])(
    'should treat a %s group mode as stacked',
    (groupMode) => {
      expect(getEffectiveBarChartGroupMode(groupMode)).toBe(
        BarChartGroupMode.STACKED,
      );
    },
  );

  it.each([BarChartGroupMode.STACKED, BarChartGroupMode.GROUPED])(
    'should keep a stored %s group mode',
    (groupMode) => {
      expect(getEffectiveBarChartGroupMode(groupMode)).toBe(groupMode);
    },
  );
});
