import { BadRequestException } from '@nestjs/common';

import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';

describe('serializeDefaultValue', () => {
  it('should return null for undefined defaultValue', () => {
    expect(serializeDefaultValue()).toBeNull();
  });

  it('should handle uuid dynamic default value', () => {
    expect(serializeDefaultValue('uuid')).toBe('public.uuid_generate_v4()');
  });

  it('should handle now dynamic default value', () => {
    expect(serializeDefaultValue('now')).toBe('now()');
  });

  it('should throw BadRequestException for invalid dynamic default value type', () => {
    expect(() => serializeDefaultValue('invalid')).toThrow(BadRequestException);
  });

  it('should handle string static default value', () => {
    expect(serializeDefaultValue("'test'")).toBe("'test'");
  });

  it('should handle number static default value', () => {
    expect(serializeDefaultValue(123)).toBe(123);
  });

  it('should handle boolean static default value', () => {
    expect(serializeDefaultValue(true)).toBe(true);
    expect(serializeDefaultValue(false)).toBe(false);
  });

  it('should handle Date static default value', () => {
    const date = new Date('2023-01-01');

    expect(serializeDefaultValue(date)).toBe(`'${date.toISOString()}'`);
  });
});
