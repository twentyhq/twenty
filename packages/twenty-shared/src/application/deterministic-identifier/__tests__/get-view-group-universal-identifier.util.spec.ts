import { getViewGroupUniversalIdentifier } from '@/application/deterministic-identifier/get-view-group-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const VIEW = '44444444-4444-4444-8444-444444444444';

describe('getViewGroupUniversalIdentifier', () => {
  it('derives a deterministic id from the field value it groups by within its view', () => {
    expect(
      getViewGroupUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        viewUniversalIdentifier: VIEW,
        fieldValue: 'OPTION_A',
      }),
    ).toBe('1d0462d5-8fc2-52b0-84f9-b297b785fa4f');
  });
});
