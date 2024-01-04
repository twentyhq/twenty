import { labelling } from '../../utils/labelling';

describe('labelling', () => {
  test('should label properly', () => {
    expect(labelling('createdAt')).toEqual('Created At');
  });
});
