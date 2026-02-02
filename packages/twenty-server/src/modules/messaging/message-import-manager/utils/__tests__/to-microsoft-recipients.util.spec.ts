import { toMicrosoftRecipients } from 'src/modules/messaging/message-import-manager/utils/to-microsoft-recipients.util';

describe('toMicrosoftRecipients', () => {
  it('should return empty array when addresses is undefined', () => {
    expect(toMicrosoftRecipients(undefined)).toEqual([]);
  });

  it('should convert a single email string to Microsoft recipient format', () => {
    const result = toMicrosoftRecipients('john@example.com');

    expect(result).toEqual([{ emailAddress: { address: 'john@example.com' } }]);
  });

  it('should convert an array of emails to Microsoft recipient format', () => {
    const result = toMicrosoftRecipients([
      'john@example.com',
      'jane@example.com',
    ]);

    expect(result).toEqual([
      { emailAddress: { address: 'john@example.com' } },
      { emailAddress: { address: 'jane@example.com' } },
    ]);
  });

  it('should return empty array for empty string array', () => {
    expect(toMicrosoftRecipients([])).toEqual([]);
  });

  it('should preserve email addresses exactly as provided', () => {
    const emailWithPlus = 'user+tag@example.com';
    const emailWithDots = 'first.last@sub.domain.com';

    const result = toMicrosoftRecipients([emailWithPlus, emailWithDots]);

    expect(result[0].emailAddress.address).toBe(emailWithPlus);
    expect(result[1].emailAddress.address).toBe(emailWithDots);
  });
});
