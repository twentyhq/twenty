import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant-manager/utils/is-email-blocklisted.util';

describe('isEmailBlocklisted', () => {
  it('should return true if email is blocklisted', () => {
    const channelHandle = 'abc@example.com';
    const email = 'hello@twenty.com';
    const blocklist = ['hello@twenty.com', 'hey@twenty.com'];
    const result = isEmailBlocklisted(channelHandle, email, blocklist);

    expect(result).toBe(true);
  });
  it('should return false if email is not blocklisted', () => {
    const channelHandle = 'abc@example.com';
    const email = 'hello@twenty.com';
    const blocklist = ['hey@example.com'];
    const result = isEmailBlocklisted(channelHandle, email, blocklist);

    expect(result).toBe(false);
  });
  it('should return false if email is null', () => {
    const channelHandle = 'abc@twenty.com';
    const email = null;
    const blocklist = ['@example.com'];
    const result = isEmailBlocklisted(channelHandle, email, blocklist);

    expect(result).toBe(false);
  });
  it('should return true for subdomains', () => {
    const channelHandle = 'abc@example.com';
    const email = 'hello@twenty.twenty.com';
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandle, email, blocklist);

    expect(result).toBe(true);
  });
  it('should return false for domains which end with blocklisted domain but are not subdomains', () => {
    const channelHandle = 'abc@example.com';
    const email = 'hello@twentytwenty.com';
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandle, email, blocklist);

    expect(result).toBe(false);
  });
  it('should return false if email is undefined', () => {
    const channelHandle = 'abc@example.com';
    const email = undefined;
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandle, email, blocklist);

    expect(result).toBe(false);
  });
  it('should return true if email ends with blocklisted domain', () => {
    const channelHandle = 'abc@example.com';
    const email = 'hello@twenty.com';
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandle, email, blocklist);

    expect(result).toBe(true);
  });

  it('should return false if email is same as channel handle', () => {
    const channelHandle = 'hello@twenty.com';
    const email = 'hello@twenty.com';
    const blocklist = ['@twenty.com'];
    const result = isEmailBlocklisted(channelHandle, email, blocklist);

    expect(result).toBe(false);
  });
});
