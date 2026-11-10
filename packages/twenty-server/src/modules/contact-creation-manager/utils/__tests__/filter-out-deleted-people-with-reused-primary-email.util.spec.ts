import { filterOutDeletedPeopleWithReusedPrimaryEmail } from 'src/modules/contact-creation-manager/utils/filter-out-deleted-people-with-reused-primary-email.util';

const buildPerson = ({
  id,
  primaryEmail,
  deletedAt = null,
}: {
  id: string;
  primaryEmail: string;
  deletedAt?: string | null;
}) => ({
  id,
  emails: { primaryEmail, additionalEmails: null },
  deletedAt,
});

describe('filterOutDeletedPeopleWithReusedPrimaryEmail', () => {
  const deletedPersonWithReusedEmail = buildPerson({
    id: 'deleted-person-with-reused-email',
    primaryEmail: 'reused@acme.test',
    deletedAt: '2026-01-01T00:00:00.000Z',
  });
  const deletedPersonWithFreeEmail = buildPerson({
    id: 'deleted-person-with-free-email',
    primaryEmail: 'free@acme.test',
    deletedAt: '2026-01-01T00:00:00.000Z',
  });
  const livePerson = buildPerson({
    id: 'live-person',
    primaryEmail: 'reused@acme.test',
  });

  it('drops a deleted person whose primary email a live person now holds', () => {
    expect(
      filterOutDeletedPeopleWithReusedPrimaryEmail({
        people: [
          deletedPersonWithReusedEmail,
          deletedPersonWithFreeEmail,
          livePerson,
        ],
        primaryEmailsOfNonDeletedPeople: ['reused@acme.test'],
      }),
    ).toEqual([deletedPersonWithFreeEmail, livePerson]);
  });
});
