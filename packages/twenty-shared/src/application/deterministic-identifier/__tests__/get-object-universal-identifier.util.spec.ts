import { getObjectUniversalIdentifier } from '@/application/deterministic-identifier/get-object-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getObjectUniversalIdentifier', () => {
  it('derives a deterministic id from the object nameSingular within its application', () => {
    expect(
      getObjectUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        nameSingular: 'rocket',
      }),
    ).toBe('676819ee-d700-5936-9d6f-58dd7f71ae07');
  });
});
