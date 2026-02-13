import {
  ErrorCode,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { getDomainNameByEmail } from 'src/utils/get-domain-name-by-email';

describe('getDomainNameByEmail', () => {
  it('should return the domain name for a valid email', () => {
    expect(getDomainNameByEmail('user@example.com')).toBe('example.com');
  });

  it('should throw a UserInputError if email is empty', () => {
    expect(() => getDomainNameByEmail('')).toThrow(UserInputError);
    expect(() => getDomainNameByEmail('')).toThrow(
      'Email is required. Please provide a valid email address.',
    );

    try {
      getDomainNameByEmail('');
    } catch (error) {
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
      expect(error.extensions.userFriendlyMessage.message).toContain(
        'Email is required. Please provide a valid email address.',
      );
    }
  });

  it('should throw a UserInputError if email does not contain "@"', () => {
    expect(() => getDomainNameByEmail('userexample.com')).toThrow(
      UserInputError,
    );

    try {
      getDomainNameByEmail('userexample.com');
    } catch (error) {
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
      expect(error.extensions.userFriendlyMessage.message).toContain(
        'The provided email address is not valid. Please use a standard email format (e.g., user@example.com).',
      );
    }
  });

  it('should throw a UserInputError if email has more than one "@"', () => {
    expect(() => getDomainNameByEmail('user@example@com')).toThrow(
      UserInputError,
    );

    try {
      getDomainNameByEmail('user@example@com');
    } catch (error) {
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
      expect(error.extensions.userFriendlyMessage.message).toContain(
        'The provided email address is not valid. Please use a standard email format (e.g., user@example.com).',
      );
    }
  });

  it('should throw a UserInputError if domain part is empty', () => {
    expect(() => getDomainNameByEmail('user@')).toThrow(UserInputError);

    try {
      getDomainNameByEmail('user@');
    } catch (error) {
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
      expect(error.extensions.userFriendlyMessage.message).toContain(
        'The provided email address is missing a domain. Please use a standard email format (e.g., user@example.com).',
      );
    }
  });

  // Edge cases with weird but potentially valid email formats
  it('should handle email with plus addressing', () => {
    expect(getDomainNameByEmail('user+tag@example.com')).toBe('example.com');
  });

  it('should handle email with dots in local part', () => {
    expect(getDomainNameByEmail('user.name@example.com')).toBe('example.com');
  });

  it('should handle email with subdomain', () => {
    expect(getDomainNameByEmail('user@mail.example.com')).toBe(
      'mail.example.com',
    );
  });

  it('should handle email with numeric domain', () => {
    expect(getDomainNameByEmail('user@123.456.1.2')).toBe('123.456.1.2');
  });

  it('should handle email with hyphenated domain', () => {
    expect(getDomainNameByEmail('user@my-domain.com')).toBe('my-domain.com');
  });

  it('should handle email with international domain (punycode)', () => {
    expect(getDomainNameByEmail('user@xn--nxasmq6b.com')).toBe(
      'xn--nxasmq6b.com',
    );
  });

  it('should handle email with very long domain', () => {
    const longDomain = 'a'.repeat(160) + '.com';

    expect(getDomainNameByEmail(`user@${longDomain}`)).toBe(longDomain);
  });

  it('should handle email with quoted local part containing spaces', () => {
    expect(getDomainNameByEmail('"user name"@example.com')).toBe('example.com');
  });

  it.skip('should handle email with special characters in quoted local part', () => {
    expect(getDomainNameByEmail('"user@#$%"@example.com')).toBe('example.com');
  });

  it.skip('should handle email with quoted local part containing @', () => {
    expect(getDomainNameByEmail('"user@local"@example.com')).toBe(
      'example.com',
    );
  });
});
