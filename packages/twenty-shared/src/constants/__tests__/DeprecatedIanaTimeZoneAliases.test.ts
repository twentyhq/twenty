import { DEPRECATED_IANA_TIME_ZONE_ALIASES } from '../DeprecatedIanaTimeZoneAliases';
import { IANA_TIME_ZONES } from '../IanaTimeZones';

describe('DEPRECATED_IANA_TIME_ZONE_ALIASES', () => {
  it.each(Object.entries(DEPRECATED_IANA_TIME_ZONE_ALIASES))(
    'maps accepted alias %s to a supported terminal timezone %s',
    (alias, canonicalTimeZone) => {
      expect(IANA_TIME_ZONES).toContain(alias);
      expect(DEPRECATED_IANA_TIME_ZONE_ALIASES).not.toHaveProperty(
        canonicalTimeZone,
      );
      expect(
        () => new Intl.DateTimeFormat('en-US', { timeZone: canonicalTimeZone }),
      ).not.toThrow();
    },
  );
});
