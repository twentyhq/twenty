import { isEmailBlocklisted } from 'src/modules/calendar-messaging-participant/utils/is-email-blocklisted.util';

describe('isEmailBlocklisted', () => {
  it('should return true if email is blocklisted', () => {
    const email = 'hello@example.com';
    const blocklist = ['hello@example.com', 'hey@example.com'];
    const result = isEmailBlocklisted(email, blocklist);

    expect(result).toBe(true);
  });
  it('should return false if email is not blocklisted', () => {
    const email = 'hello@twenty.com';
    const blocklist = ['hey@example.com'];
    const result = isEmailBlocklisted(email, blocklist);

    expect(result).toBe(false);
  });
  it('should return false if email is null', () => {
    const email = null;
    const blocklist = ['@example.com'];
    const result = isEmailBlocklisted(email, blocklist);

    expect(result).toBe(false);
  });
  it('should return false if email is undefined', () => {
    const email = undefined;
    const blocklist = ['@example.com'];
    const result = isEmailBlocklisted(email, blocklist);

    expect(result).toBe(false);
  });
  it('should return true if email ends with blocklisted domain', () => {
    const email = 'hello@example.com';
    const blocklist = ['@example.com'];
    const result = isEmailBlocklisted(email, blocklist);

    expect(result).toBe(true);
  });
});
