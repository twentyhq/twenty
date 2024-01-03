import { capitalize } from '../../utils/capitalize';

describe('capitalize', () => {
  test('should capitalize properly', () => {
    expect(capitalize('word')).toEqual('Word');
    expect(capitalize('word word')).toEqual('Word word');
  });
});
