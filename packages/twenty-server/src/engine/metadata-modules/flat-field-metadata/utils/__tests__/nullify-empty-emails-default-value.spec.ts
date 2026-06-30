import { nullifyEmptyEmailsDefaultValue } from '../nullify-empty-emails-default-value.util';

describe('nullifyEmptyEmailsDefaultValue', () => {
  it('returns null when all sub-fields are empty-string equivalents', () => {
    expect(
      nullifyEmptyEmailsDefaultValue({
        primaryEmail: "''",
        additionalEmails: [],
      }),
    ).toBeNull();
  });

  it('returns normalized object when primaryEmail has a value', () => {
    expect(
      nullifyEmptyEmailsDefaultValue({
        primaryEmail: 'user@example.com',
        additionalEmails: [],
      }),
    ).toEqual({ primaryEmail: 'user@example.com', additionalEmails: null });
  });
});
