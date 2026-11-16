export const isMicrosoftCalendarResourceAttendee = (attendee: {
  type?: string | null;
}): boolean => attendee.type === 'resource';
