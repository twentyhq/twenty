import { isNonEmptyArray } from '@sniptt/guards';
import { tzlib_get_ical_block } from 'timezones-ical-library';

export const toICalTimeZone = (timeZone: string) => {
  const vTimezoneBlockAndTzidParameter = tzlib_get_ical_block(timeZone);

  if (!isNonEmptyArray(vTimezoneBlockAndTzidParameter)) {
    return { timeZoneId: timeZone, vTimezoneBlock: '' };
  }

  const [vTimezoneBlock, tzidParameter] = vTimezoneBlockAndTzidParameter;

  return {
    timeZoneId: tzidParameter.replace(/^TZID=/, ''),
    vTimezoneBlock,
  };
};
