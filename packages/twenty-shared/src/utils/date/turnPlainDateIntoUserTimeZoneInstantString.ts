import { type Temporal } from 'temporal-polyfill';

export const turnPlainDateIntoUserTimeZoneInstantString = (
  plainDate: Temporal.PlainDate,
  userTimeZone: string,
) => {
  try {
    return plainDate.toZonedDateTime(userTimeZone).toInstant().toString();
  } catch (error) {
    console.warn(
      `Invalid timezone "${userTimeZone}" provided to turnPlainDateIntoUserTimeZoneInstantString. Falling back to UTC.`,
    );
    return plainDate.toZonedDateTime('UTC').toInstant().toString();
  }
};
