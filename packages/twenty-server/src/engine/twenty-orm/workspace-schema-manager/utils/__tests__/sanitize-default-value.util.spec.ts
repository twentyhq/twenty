import { sanitizeDefaultValue } from 'src/engine/twenty-orm/workspace-schema-manager/utils/sanitize-default-value.util';

describe('sanitizeDefaultValue', () => {
  describe('allowed functions', () => {
    it('should allow uuid_generate_v4() function', () => {
      // Prepare
      const input = 'public.uuid_generate_v4()';

      // Act
      const result = sanitizeDefaultValue(input);

      // Assert
      expect(result).toBe('public.uuid_generate_v4()');
    });

    it('should allow now() function', () => {
      // Prepare
      const input = 'now()';

      // Act
      const result = sanitizeDefaultValue(input);

      // Assert
      expect(result).toBe('now()');
    });

    it('should be case insensitive for allowed functions', () => {
      // Act & Assert

      expect(sanitizeDefaultValue('NOW()')).toBe('NOW()');
    });
  });

  describe('SQL injection prevention', () => {
    it('should sanitize potential SQL injection in string values', () => {
      // Prepare
      const maliciousInput = "'; DROP TABLE users; --";

      // Act
      const result = sanitizeDefaultValue(maliciousInput);

      // Assert
      expect(result).not.toContain('DROP TABLE');
      expect(result).not.toContain(';');
      expect(result).not.toContain('--');
      expect(result).toBe("'DROPTABLEusers'");
    });

    it('should sanitize quotes in string values', () => {
      // Prepare
      const inputWithQuotes = 'test"value';

      // Act
      const result = sanitizeDefaultValue(inputWithQuotes);

      // Assert
      expect(result).not.toContain('"');
      expect(result).toBe("'testvalue'");
    });

    it('should sanitize parentheses in non-function values', () => {
      // Prepare
      const inputWithParens = 'test(value)';

      // Act
      const result = sanitizeDefaultValue(inputWithParens);

      // Assert
      expect(result).not.toContain('(');
      expect(result).not.toContain(')');
      expect(result).toBe("'testvalue'");
    });

    it('should sanitize backslashes', () => {
      // Prepare
      const inputWithBackslash = 'test\\value';

      // Act
      const result = sanitizeDefaultValue(inputWithBackslash);

      // Assert
      expect(result).not.toContain('\\');
      expect(result).toBe("'testvalue'");
    });

    it('should sanitize SQL comment patterns', () => {
      // Prepare
      const inputWithComments = 'value/*comment*/test';

      // Act
      const result = sanitizeDefaultValue(inputWithComments);

      // Assert
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
      expect(result).toBe("'valuecommenttest'");
    });

    it('should remove non-alphanumeric characters but preserve SQL keywords in alphanumeric form', () => {
      // Prepare
      const inputWithKeywords = 'SELECT * FROM users';

      // Act
      const result = sanitizeDefaultValue(inputWithKeywords);

      // Assert
      expect(result).toBe("'SELECTFROMusers'");
      expect(result).not.toContain('*');
      expect(result).not.toContain(' ');
    });
  });

  describe('regular values', () => {
    it('should preserve underscores and alphanumeric characters in simple string values', () => {
      // Prepare
      const input = 'simple_value';

      // Act
      const result = sanitizeDefaultValue(input);

      // Assert
      expect(result).toBe("'simple_value'");
    });

    it('should preserve numeric values', () => {
      // Prepare
      const input = 12345;

      // Act
      const result = sanitizeDefaultValue(input);

      // Assert
      expect(result).toBe(12345);
    });

    it('should preserve boolean values', () => {
      // Act & Assert
      expect(sanitizeDefaultValue(true)).toBe(true);
      expect(sanitizeDefaultValue(false)).toBe(false);
    });

    it('should handle empty string', () => {
      // Prepare
      const input = '';

      // Act
      const result = sanitizeDefaultValue(input);

      // Assert
      expect(result).toBe("''");
    });

    it('should remove whitespace but preserve alphanumeric and underscores', () => {
      // Prepare
      const input = '  test  ';

      // Act
      const result = sanitizeDefaultValue(input);

      // Assert
      expect(result).toBe("'test'");
    });

    it('should preserve alphanumeric values with underscores', () => {
      // Prepare
      const input = 'test_value_123';

      // Act
      const result = sanitizeDefaultValue(input);

      // Assert
      expect(result).toBe("'test_value_123'");
    });
  });

  describe('mixed cases', () => {
    it('should distinguish between allowed functions and similar strings', () => {
      // Act & Assert
      expect(sanitizeDefaultValue('now()')).toBe('now()');
      expect(sanitizeDefaultValue('now_test')).toBe("'now_test'");
      expect(sanitizeDefaultValue('not_now()')).toBe("'not_now'");
    });

    it('should handle functions with different casing but sanitize non-functions normally', () => {
      // Act & Assert
      expect(sanitizeDefaultValue('NOW()')).toBe('NOW()');
      expect(sanitizeDefaultValue('now_function')).toBe("'now_function'");
    });

    it('should handle complex mixed input', () => {
      // Prepare
      const complexInput = 'test"value; DROP TABLE users; /* comment */ now()';

      // Act
      const result = sanitizeDefaultValue(complexInput);

      // Assert
      expect(result).toBe("'testvalueDROPTABLEuserscommentnow'");
      expect(result).not.toContain(';');
      expect(result).not.toContain('"');
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
      expect(result).not.toContain(' ');
    });
  });

  describe('edge cases', () => {
    it('should handle null', () => {
      // Act & Assert
      expect(sanitizeDefaultValue(null)).toBe('NULL');
    });

    it('should handle strings that start with allowed function names', () => {
      // Act & Assert
      expect(sanitizeDefaultValue('now_extended')).toBe("'now_extended'");
      expect(sanitizeDefaultValue('gen_random_uuid_custom')).toBe(
        "'gen_random_uuid_custom'",
      );
    });

    it('should handle strings with special characters', () => {
      // Prepare
      const specialChars = '!@#$%^&*()+=[]{}|\\:";\'<>?,.';

      // Act
      const result = sanitizeDefaultValue(specialChars);

      // Assert
      expect(result).toBe("''");
    });

    it('should handle very long strings', () => {
      // Prepare
      const longString = 'a'.repeat(1000) + '; DROP TABLE users;';

      // Act
      const result = sanitizeDefaultValue(longString);

      // Assert
      expect(result).toBe(`'${'a'.repeat(1000)}DROPTABLEusers'`);
      expect(result).not.toContain(';');
      expect(result).not.toContain(' ');
    });
  });
});
