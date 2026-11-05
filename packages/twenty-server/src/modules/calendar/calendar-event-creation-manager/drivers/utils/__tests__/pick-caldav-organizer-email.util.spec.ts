import { pickCalDavOrganizerEmail } from 'src/modules/calendar/calendar-event-creation-manager/drivers/utils/pick-caldav-organizer-email.util';

describe('pickCalDavOrganizerEmail', () => {
  it('prefers the address matching the handle, ignoring case', () => {
    expect(
      pickCalDavOrganizerEmail({
        calendarUserAddresses: [
          'urn:uuid:7f1c2b',
          'mailto:alias@acme.test',
          'mailto:Jane.Doe@acme.test',
        ],
        handle: 'jane.doe@acme.test',
      }),
    ).toBe('Jane.Doe@acme.test');
  });

  it('uses the first server address when none matches the handle', () => {
    expect(
      pickCalDavOrganizerEmail({
        calendarUserAddresses: [
          '/principals/jane/',
          'MAILTO:scheduling@acme.test',
        ],
        handle: 'jane@acme.test',
      }),
    ).toBe('scheduling@acme.test');
  });

  it('falls back to the handle when the server lists no mailto address', () => {
    expect(
      pickCalDavOrganizerEmail({
        calendarUserAddresses: ['/jane@acme.test/'],
        handle: 'jane@acme.test',
      }),
    ).toBe('jane@acme.test');
  });
});
