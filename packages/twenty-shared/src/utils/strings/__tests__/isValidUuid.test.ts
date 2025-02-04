import { isValidUuid } from '../isValidUuid.util';

describe('isValidUuid', () => {
  it('should return true for a valid UUID', () => {
    expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('should return false for an invalid UUID', () => {
    expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(false);
  });
});
