import { isValidUniversalIdentifier } from '@/application/utils/isValidUniversalIdentifier';

describe('isValidUniversalIdentifier', () => {
  it.each([4, 5, 6, 7, 8])('should accept UUIDv%s', (version) => {
    const universalIdentifier = `bbbbbbbb-bbbb-${version}bbb-8bbb-bbbbbbbbbbbb`;

    expect(isValidUniversalIdentifier(universalIdentifier)).toBe(true);
    expect(isValidUniversalIdentifier(universalIdentifier.toUpperCase())).toBe(
      true,
    );
  });

  it.each([1, 2, 3])('should reject UUIDv%s', (version) => {
    expect(
      isValidUniversalIdentifier(
        `bbbbbbbb-bbbb-${version}bbb-8bbb-bbbbbbbbbbbb`,
      ),
    ).toBe(false);
  });

  it.each([
    '',
    'invalid',
    'bbbbbbbbbbbb4bbb8bbbbbbbbbbbbbbb',
    'bbbbbbbb-bbbb-4bbb-0bbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-9bbb-8bbb-bbbbbbbbbbbb',
    ' bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000000',
  ])('should reject invalid universal identifier %j', (universalIdentifier) => {
    expect(isValidUniversalIdentifier(universalIdentifier)).toBe(false);
  });

  it('should preserve acceptance of the maximum UUID', () => {
    expect(
      isValidUniversalIdentifier('ffffffff-ffff-ffff-ffff-ffffffffffff'),
    ).toBe(true);
  });
});
