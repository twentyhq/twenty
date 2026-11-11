import {
  DEPRECATED_IANA_TIME_ZONE_ALIASES,
  IANA_TIME_ZONES,
} from 'twenty-shared/constants';
import { getValidTimeZoneOrUndefined, isDefined } from 'twenty-shared/utils';

// The date group-by only accepts IANA_TIME_ZONES names
const GROUP_BY_TIME_ZONES = new Set<string>(IANA_TIME_ZONES);

// Reversed so the first deprecated name wins, as several merged zones share one current name
const GROUP_BY_TIME_ZONE_BY_CURRENT_NAME = new Map(
  Object.entries(DEPRECATED_IANA_TIME_ZONE_ALIASES)
    .filter(([deprecatedName]) => GROUP_BY_TIME_ZONES.has(deprecatedName))
    .map(([deprecatedName, currentName]): [string, string] => [
      currentName,
      deprecatedName,
    ])
    .reverse(),
);

const toGroupByTimeZone = (
  timeZone: string | null | undefined,
): string | undefined => {
  const validTimeZone = getValidTimeZoneOrUndefined(timeZone);

  if (!isDefined(validTimeZone)) {
    return undefined;
  }

  const canonicalTimeZone = new Intl.DateTimeFormat('en-US', {
    timeZone: validTimeZone,
  }).resolvedOptions().timeZone;

  return [
    validTimeZone,
    canonicalTimeZone,
    GROUP_BY_TIME_ZONE_BY_CURRENT_NAME.get(validTimeZone),
    GROUP_BY_TIME_ZONE_BY_CURRENT_NAME.get(canonicalTimeZone),
  ].find((name) => isDefined(name) && GROUP_BY_TIME_ZONES.has(name));
};

export const resolveChartTimeZone = ({
  viewerTimeZone,
  widgetTimeZone,
}: {
  viewerTimeZone: string | null | undefined;
  widgetTimeZone: string | null | undefined;
}): string =>
  toGroupByTimeZone(viewerTimeZone) ??
  toGroupByTimeZone(widgetTimeZone) ??
  'UTC';
