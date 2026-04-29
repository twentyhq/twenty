// Full-day events use VALUE=DATE on DTSTART. node-ical normalises to JS Date,
// so the parameter is only visible on raw iCal lines.
// @see https://tools.ietf.org/html/rfc5545#section-3.3.4
export const isFullDayEvent = (rawICalData: string): boolean =>
  rawICalData
    .split(/\r?\n/)
    .some(
      (line) =>
        line.trim().startsWith('DTSTART') && line.includes('VALUE=DATE'),
    );
