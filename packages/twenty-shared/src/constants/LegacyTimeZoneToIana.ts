import { type IanaTimeZone } from './IanaTimeZones';

// Legacy IANA abbreviation zones that V8 (Chrome/Node) accepts but WebKit's ICU
// rejects with a RangeError. Each maps to a canonical region zone with the same
// current UTC offset and DST rules.
export const LEGACY_TIME_ZONE_TO_IANA: Record<string, IanaTimeZone> = {
  CET: 'Europe/Paris',
  MET: 'Europe/Berlin',
  WET: 'Europe/Lisbon',
  EET: 'Europe/Bucharest',
};
