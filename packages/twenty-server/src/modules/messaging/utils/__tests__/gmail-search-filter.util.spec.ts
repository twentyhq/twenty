import {
  excludedCategoriesAndFileTypesString,
  gmailSearchFilterEmailAdresses,
  gmailSearchFilterExcludeEmailAdresses,
  gmailSearchFilterIncludeOnlyEmailAdresses,
  gmailSearchFilterNonPersonalEmails,
} from 'src/modules/messaging/utils/gmail-search-filter.util';

describe('gmailSearchFilterExcludeEmailAdresses', () => {
  it('should return correct search filter for excluding emails', () => {
    const emails = ['hello@twenty.com', 'hey@twenty.com'];
    const result = gmailSearchFilterExcludeEmailAdresses(emails);

    expect(result).toBe(
      `(in:inbox from:-(${gmailSearchFilterNonPersonalEmails}|hello@twenty.com|hey@twenty.com)|(in:sent to:-(${gmailSearchFilterNonPersonalEmails}|hello@twenty.com|hey@twenty.com)) ${excludedCategoriesAndFileTypesString}`,
    );
  });
  it('should return correct search filter for excluding emails when no emails are provided', () => {
    const result = gmailSearchFilterExcludeEmailAdresses();

    expect(result).toBe(
      `from:-(${gmailSearchFilterNonPersonalEmails}) ${excludedCategoriesAndFileTypesString}`,
    );
  });
});

describe('gmailSearchFilterIncludeOnlyEmailAdresses', () => {
  it('should return correct search filter for including emails', () => {
    const emails = ['hello@twenty.com', 'hey@twenty.com'];
    const result = gmailSearchFilterIncludeOnlyEmailAdresses(emails);

    expect(result).toBe(
      `(in:inbox from:(hello@twenty.com|hey@twenty.com)|(in:sent to:(hello@twenty.com|hey@twenty.com)) ${excludedCategoriesAndFileTypesString}`,
    );
  });
  it('should return undefined when no emails are provided', () => {
    const result = gmailSearchFilterIncludeOnlyEmailAdresses();

    expect(result).toBe(undefined);
  });
});

describe('gmailSearchFilterEmailAdresses', () => {
  it('should return correct search filter for including emails and excluding emails', () => {
    const includedEmails = ['hello@twenty.com', 'hey@twenty.com'];

    const excludedEmails = ['noreply@twenty.com', 'no-reply@twenty.com'];

    const result = gmailSearchFilterEmailAdresses(
      includedEmails,
      excludedEmails,
    );

    expect(result).toBe(
      `(in:inbox from:((hello@twenty.com|hey@twenty.com) -(${gmailSearchFilterNonPersonalEmails}|noreply@twenty.com|no-reply@twenty.com))|(in:sent to:((hello@twenty.com|hey@twenty.com) -(${gmailSearchFilterNonPersonalEmails}|noreply@twenty.com|no-reply@twenty.com)) ${excludedCategoriesAndFileTypesString}`,
    );
  });
});
