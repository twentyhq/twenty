import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';

export const findImportedMessageSubjects = async (
  subjects: string[],
): Promise<string[]> => {
  const messages = await findRecordNodesByFilter<{ subject: string }>(
    'message',
    'messages',
    'subject',
    { subject: { in: subjects } },
  );

  return messages.map((message) => message.subject).sort();
};

export const findImportedCalendarEventTitles = async (
  titles: string[],
): Promise<string[]> => {
  const events = await findRecordNodesByFilter<{ title: string }>(
    'calendarEvent',
    'calendarEvents',
    'title',
    { title: { in: titles } },
  );

  return events.map((event) => event.title).sort();
};
