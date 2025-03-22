import { isValidUuid } from '@/utils/validation/isValidUuid';

describe('isValidUuid', () => {
  it('should return true for a valid UUID', () => {
    expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('should return false for an invalid UUID', () => {
    expect(isValidUuid('invalid-uuid')).toBe(false);
    expect(isValidUuid('12345')).toBe(false);
    expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false);
    expect(isValidUuid('')).toBe(false);
    expect(isValidUuid('123e4567-e89b-12d3-a456-42661417400-')).toBe(false);
    expect(isValidUuid('123e4567-e89b-12d3-a456-42661417400')).toBe(false);
    expect(isValidUuid('123e4567-e89b-12d3-a456-42661417400)')).toBe(false);
    expect(isValidUuid('123e4567-e89b-12d3-a456-4266141740001')).toBe(false);
  });
});
