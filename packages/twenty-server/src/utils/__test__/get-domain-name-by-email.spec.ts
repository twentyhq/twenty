import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

describe('getDomainNameByEmail', () => {
  it('should return the domain name for a valid email', () => {
    expect(getDomainNameByEmail('user@example.com')).toBe('example.com');
  });

  it('should throw an error if email is empty', () => {
    expect(() => getDomainNameByEmail('')).toThrow('Email is required');
  });

  it('should throw an error if email does not contain "@"', () => {
    expect(() => getDomainNameByEmail('userexample.com')).toThrow(
      'Invalid email format',
    );
  });

  it('should throw an error if email has more than one "@"', () => {
    expect(() => getDomainNameByEmail('user@example@com')).toThrow(
      'Invalid email format',
    );
  });

  it('should throw an error if domain part is empty', () => {
    expect(() => getDomainNameByEmail('user@')).toThrow('Invalid email format');
  });
});
