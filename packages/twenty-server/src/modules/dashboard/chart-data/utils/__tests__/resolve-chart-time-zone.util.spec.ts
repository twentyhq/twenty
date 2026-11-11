import { resolveChartTimeZone } from 'src/modules/dashboard/chart-data/utils/resolve-chart-time-zone.util';

describe('resolveChartTimeZone', () => {
  it.each<
    [string, string | null | undefined, string | null | undefined, string]
  >([
    ["the viewer's zone", 'Asia/Tokyo', 'Europe/Paris', 'Asia/Tokyo'],
    [
      "the group-by name of the viewer's renamed zone",
      'Europe/Kyiv',
      'Europe/Paris',
      'Europe/Kiev',
    ],
    ["the canonical case of the viewer's zone", 'utc', 'Europe/Paris', 'UTC'],
    [
      "the widget's zone when the group-by does not know the viewer's",
      'America/Ciudad_Juarez',
      'Europe/Paris',
      'Europe/Paris',
    ],
    [
      "the widget's zone when no viewer zone is sent",
      undefined,
      'Europe/Paris',
      'Europe/Paris',
    ],
    [
      'UTC when the group-by knows neither zone',
      'America/Ciudad_Juarez',
      'Mars/Olympus_Mons',
      'UTC',
    ],
    ['UTC when there is no zone at all', null, undefined, 'UTC'],
  ])(
    'should resolve %s',
    (_title, viewerTimeZone, widgetTimeZone, expectedTimeZone) => {
      expect(resolveChartTimeZone({ viewerTimeZone, widgetTimeZone })).toBe(
        expectedTimeZone,
      );
    },
  );
});
