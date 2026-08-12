import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';

export const findCreatedPeopleEmails = async (
  primaryEmails: string[],
): Promise<string[]> => {
  const people = await findRecordNodesByFilter<{
    emails: { primaryEmail: string };
  }>('person', 'people', 'emails { primaryEmail }', {
    emails: { primaryEmail: { in: primaryEmails } },
  });

  return people.map((person) => person.emails.primaryEmail).sort();
};
