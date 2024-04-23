import {
  gmailSearchFilterExcludeEmailAdresses,
  gmailSearchFilterIncludeOnlyEmailAdresses,
  gmailSearchFilterNonPersonalEmails,
} from 'src/modules/messaging/utils/gmail-search-filter.util';

describe('gmailSearchFilterExcludeEmailAdresses', () => {
  it('should return correct search filter for excluding emails', () => {
    const emails = ['hello@twenty.com', 'hey@twenty.com'];
    const result = gmailSearchFilterExcludeEmailAdresses(emails);

    expect(result).toBe(
      `(in:inbox from:-(${gmailSearchFilterNonPersonalEmails}|hello@twenty.com|hey@twenty.com)|(in:sent to:-(${gmailSearchFilterNonPersonalEmails}|hello@twenty.com|hey@twenty.com)) -category:promotions -category:social -category:forums -filename:.ics`,
    );
  });
  it('should return correct search filter for excluding emails when no emails are provided', () => {
    const result = gmailSearchFilterExcludeEmailAdresses();

    expect(result).toBe(
      `from:-(${gmailSearchFilterNonPersonalEmails}) -category:promotions -category:social -category:forums -filename:.ics`,
    );
  });
});

describe('gmailSearchFilterIncludeOnlyEmailAdresses', () => {
  it('should return correct search filter for including emails', () => {
    const emails = ['hello@twenty.com', 'hey@twenty.com'];
    const result = gmailSearchFilterIncludeOnlyEmailAdresses(emails);

    expect(result).toBe(
      `(in:inbox from:(hello@twenty.com|hey@twenty.com)|(in:sent to:(hello@twenty.com|hey@twenty.com)) -category:promotions -category:social -category:forums -filename:.ics`,
    );
  });
  it('should return undefined when no emails are provided', () => {
    const result = gmailSearchFilterIncludeOnlyEmailAdresses();

    expect(result).toBe(undefined);
  });
});
