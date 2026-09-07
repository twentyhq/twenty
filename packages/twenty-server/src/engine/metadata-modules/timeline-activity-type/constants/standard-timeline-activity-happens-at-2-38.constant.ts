// Runtime uses this frozen copy until every workspace has completed 2.38.
export const STANDARD_TIMELINE_ACTIVITY_HAPPENS_AT_2_38 = [
  {
    // messageLinked anchors at message.receivedAt
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c0f',
    happensAtFieldUniversalIdentifier: '20202020-140a-4a2a-9f86-f13b6a979afc',
  },
  {
    // calendarEventLinked anchors at calendarEvent.startsAt
    universalIdentifier: '20202020-0d1a-4f0e-8a55-1c0a2f0a2c10',
    happensAtFieldUniversalIdentifier: '20202020-2c57-4c75-93c5-2ac950a6ed67',
  },
] as const;
