import { getFrontComponentUniversalIdentifier } from '@/application/deterministic-identifier/get-front-component-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getFrontComponentUniversalIdentifier', () => {
  it('derives a deterministic id from the component name within its application', () => {
    expect(
      getFrontComponentUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        componentName: 'HelloWorld',
      }),
    ).toBe('a81d9442-d9ff-557b-b5b7-494b9c629b23');
  });
});
