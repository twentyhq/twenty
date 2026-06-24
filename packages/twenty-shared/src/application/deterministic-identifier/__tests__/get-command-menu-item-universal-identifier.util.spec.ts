import {
  getCommandMenuItemUniversalIdentifier,
  getNavigationCommandUniversalIdentifier,
} from '@/application/deterministic-identifier/get-command-menu-item-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getCommandMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the command label within its application', () => {
    expect(
      getCommandMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        label: 'Create Record',
      }),
    ).toBe('e284adf7-5332-5253-9c94-9e6b3c57237f');
  });
});

describe('getNavigationCommandUniversalIdentifier', () => {
  it('derives a deterministic id from the navigation role within its object', () => {
    expect(
      getNavigationCommandUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
      }),
    ).toBe('ec4626f3-3170-5ddc-a309-bdf2a18d4e84');
  });
});
