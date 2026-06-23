import { getNavigationMenuItemUniversalIdentifier } from '@/application/deterministic-identifier/get-navigation-menu-item-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';

describe('getNavigationMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the item name within its application', () => {
    expect(
      getNavigationMenuItemUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'Home',
      }),
    ).toBe('dc0ca522-7f09-567d-a7f7-d33824495fc4');
  });
});
