import { getConnectionProviderUniversalIdentifier } from '@/application/deterministic-identifier/get-connection-provider-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getConnectionProviderUniversalIdentifier', () => {
  it('derives a deterministic id from the provider name within its application', () => {
    expect(
      getConnectionProviderUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'Gmail',
      }),
    ).toBe('69c2371f-465c-57cd-9d36-3fbba8ea8510');
  });
});
