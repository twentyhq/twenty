import { uuidToBase36 } from '@/utils/uuidToBase36';

describe('uuidToBase36', () => {
  it('should convert a UUID to base36', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const result = uuidToBase36(uuid);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // base36 only contains alphanumeric characters
    expect(result).toMatch(/^[0-9a-z]+$/);
  });

  it('should produce consistent results', () => {
    const uuid = '00000000-0000-0000-0000-000000000001';

    expect(uuidToBase36(uuid)).toBe(uuidToBase36(uuid));
  });

  it('should convert the zero UUID', () => {
    const uuid = '00000000-0000-0000-0000-000000000000';

    expect(uuidToBase36(uuid)).toBe('0');
  });
});
