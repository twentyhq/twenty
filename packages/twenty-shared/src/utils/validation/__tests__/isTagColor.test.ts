import { isTagColor } from '@/utils';

describe('isTagColor', () => {
  it.each(['gray', 'blue', 'turquoise'])('accepts %s', (color) => {
    expect(isTagColor(color)).toBe(true);
  });

  it.each([undefined, null, '', 'grey', 'Blue', ' blue', 42])(
    'rejects %p',
    (value) => {
      expect(isTagColor(value)).toBe(false);
    },
  );
});
