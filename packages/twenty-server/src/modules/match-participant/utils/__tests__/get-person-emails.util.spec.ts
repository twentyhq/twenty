import { getPersonEmails } from 'src/modules/match-participant/utils/get-person-emails.util';

describe('getPersonEmails', () => {
  it('should return the primary email followed by the additional emails', () => {
    expect(
      getPersonEmails({
        primaryEmail: 'primary@example.com',
        additionalEmails: ['additional@example.com'],
      }),
    ).toEqual(['primary@example.com', 'additional@example.com']);
  });

  it('should return no emails for a person whose emails field is cleared', () => {
    expect(getPersonEmails({ primaryEmail: '', additionalEmails: [] })).toEqual(
      [],
    );
  });

  it('should return the additional emails when there is no primary email', () => {
    expect(
      getPersonEmails({
        primaryEmail: '',
        additionalEmails: ['additional@example.com'],
      }),
    ).toEqual(['additional@example.com']);
  });

  it('should return the primary email when additional emails are null', () => {
    expect(
      getPersonEmails({
        primaryEmail: 'primary@example.com',
        additionalEmails: null,
      }),
    ).toEqual(['primary@example.com']);
  });
});
