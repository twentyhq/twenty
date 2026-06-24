import { getViewFieldGroupUniversalIdentifier } from '@/application/deterministic-identifier/get-view-field-group-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const VIEW = '44444444-4444-4444-8444-444444444444';

describe('getViewFieldGroupUniversalIdentifier', () => {
  it('derives a deterministic id from the group name within its view', () => {
    expect(
      getViewFieldGroupUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        viewUniversalIdentifier: VIEW,
        name: 'General',
      }),
    ).toBe('26350cf1-bec3-5617-b525-c0115811963e');
  });
});
