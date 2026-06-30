import {
  getFolderNavigationMenuItemUniversalIdentifier,
  getLinkNavigationMenuItemUniversalIdentifier,
  getObjectNavigationMenuItemUniversalIdentifier,
  getViewNavigationMenuItemUniversalIdentifier,
} from '@/application/deterministic-identifier/get-navigation-menu-item-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';
const VIEW = '44444444-4444-4444-8444-444444444444';

describe('getFolderNavigationMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the folder name within its application', () => {
    expect(
      getFolderNavigationMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        name: 'Workflows',
      }),
    ).toBe('ca043c51-ac75-515d-902b-dd836626bba4');
  });
});

describe('getObjectNavigationMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the object it targets', () => {
    expect(
      getObjectNavigationMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
      }),
    ).toBe('071361bd-47c8-5513-be33-998dd287f8c7');
  });
});

describe('getViewNavigationMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the view it targets', () => {
    expect(
      getViewNavigationMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        viewUniversalIdentifier: VIEW,
      }),
    ).toBe('6504fd6d-ed38-5f34-87fc-26025130260f');
  });
});

describe('getLinkNavigationMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from its target URL', () => {
    expect(
      getLinkNavigationMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        link: 'https://example.com',
      }),
    ).toBe('635cef97-cc61-53a3-873e-38fecf3ecbd7');
  });
});
