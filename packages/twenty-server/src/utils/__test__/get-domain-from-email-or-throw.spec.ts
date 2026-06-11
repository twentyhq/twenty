import {
  ErrorCode,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { getDomainFromEmailOrThrow } from 'src/utils/get-domain-from-email-or-throw';

describe('getDomainFromEmailOrThrow', () => {
  it('should return the domain name for a valid email', () => {
    expect(getDomainFromEmailOrThrow('user@example.com')).toBe('example.com');
  });

  it('should throw a UserInputError if email is empty', () => {
    expect(() => getDomainFromEmailOrThrow('')).toThrow(UserInputError);
    expect(() => getDomainFromEmailOrThrow('')).toThrow(
      'Email is required. Please provide a valid email address.',
    );

    try {
      getDomainFromEmailOrThrow('');
    } catch (error) {
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
      expect(error.extensions.userFriendlyMessage.message).toContain(
        'Email is required. Please provide a valid email address.',
      );
    }
  });

  it('should throw a UserInputError if email does not contain "@"', () => {
    expect(() => getDomainFromEmailOrThrow('userexample.com')).toThrow(
      UserInputError,
    );

    try {
      getDomainFromEmailOrThrow('userexample.com');
    } catch (error) {
      expect(error).toBeInstanceOf(UserInputError);
      expect(error.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
      expect(error.extensions.userFriendlyMessage.message).toContain(
        'The provided email address is not valid. Please use a standard email format (e.g., user@example.com).',
      );
    }
  });

  it('should return the domain after the last "@"', () => {
    expect(getDomainFromEmailOrThrow('"a@b"@example.com')).toBe('example.com');
    expect(getDomainFromEmailOrThrow('user@example@com')).toBe('com');
  });

  it('should throw a UserInputError if domain part is empty', () => {
    expect(() => getDomainFromEmailOrThrow('user@')).toThrow(UserInputError);

    try {
      getDomainFromEmailOrThrow('user@');
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
    expect(getDomainFromEmailOrThrow('user+tag@example.com')).toBe(
      'example.com',
    );
  });

  it('should handle email with dots in local part', () => {
    expect(getDomainFromEmailOrThrow('user.name@example.com')).toBe(
      'example.com',
    );
  });

  it('should handle email with subdomain', () => {
    expect(getDomainFromEmailOrThrow('user@mail.example.com')).toBe(
      'mail.example.com',
    );
  });

  it('should handle email with numeric domain', () => {
    expect(getDomainFromEmailOrThrow('user@123.456.1.2')).toBe('123.456.1.2');
  });

  it('should handle email with hyphenated domain', () => {
    expect(getDomainFromEmailOrThrow('user@my-domain.com')).toBe(
      'my-domain.com',
    );
  });

  it('should handle email with international domain (punycode)', () => {
    expect(getDomainFromEmailOrThrow('user@xn--nxasmq6b.com')).toBe(
      'xn--nxasmq6b.com',
    );
  });

  it('should handle email with very long domain', () => {
    const longDomain = 'a'.repeat(160) + '.com';

    expect(getDomainFromEmailOrThrow(`user@${longDomain}`)).toBe(longDomain);
  });

  it('should handle email with quoted local part containing spaces', () => {
    expect(getDomainFromEmailOrThrow('"user name"@example.com')).toBe(
      'example.com',
    );
  });

  it('should handle email with special characters in quoted local part', () => {
    expect(getDomainFromEmailOrThrow('"user@#$%"@example.com')).toBe(
      'example.com',
    );
  });

  it('should handle email with quoted local part containing @', () => {
    expect(getDomainFromEmailOrThrow('"user@local"@example.com')).toBe(
      'example.com',
    );
  });
});
