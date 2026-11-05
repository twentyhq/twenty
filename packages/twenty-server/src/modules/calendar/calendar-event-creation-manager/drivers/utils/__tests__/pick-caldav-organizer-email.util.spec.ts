import { pickCalDavOrganizerEmail } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/pick-caldav-organizer-email.util';

describe('pickCalDavOrganizerEmail', () => {
  it('prefers the address matching the handle, ignoring case', () => {
    expect(
      pickCalDavOrganizerEmail(
        [
          'urn:uuid:7f1c2b',
          'mailto:alias@acme.test',
          'mailto:Jane.Doe@acme.test',
        ],
        'jane.doe@acme.test',
      ),
    ).toBe('Jane.Doe@acme.test');
  });

  it('uses the first server address when none matches the handle', () => {
    expect(
      pickCalDavOrganizerEmail(
        ['/principals/jane/', 'MAILTO:scheduling@acme.test'],
        'jane@acme.test',
      ),
    ).toBe('scheduling@acme.test');
  });

  it('falls back to the handle when the server lists no mailto address', () => {
    expect(
      pickCalDavOrganizerEmail(['/jane@acme.test/'], 'jane@acme.test'),
    ).toBe('jane@acme.test');
  });
});
