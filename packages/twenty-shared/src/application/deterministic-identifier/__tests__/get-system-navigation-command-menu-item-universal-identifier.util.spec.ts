import { getSystemNavigationCommandMenuItemUniversalIdentifier } from '@/application/deterministic-identifier/get-system-navigation-command-menu-item-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getSystemNavigationCommandMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the navigation role within its object', () => {
    expect(
      getSystemNavigationCommandMenuItemUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
      }),
    ).toBe('ec4626f3-3170-5ddc-a309-bdf2a18d4e84');
  });
});
