import {
  getGlobalCommandMenuItemUniversalIdentifier,
  getGlobalObjectContextCommandMenuItemUniversalIdentifier,
  getNavigationCommandUniversalIdentifier,
  getRecordSelectionCommandMenuItemUniversalIdentifier,
} from '@/application/deterministic-identifier/get-command-menu-item-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getGlobalCommandMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the engineComponentKey within GLOBAL', () => {
    expect(
      getGlobalCommandMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        engineComponentKey: 'EXPORT_RECORDS',
      }),
    ).toBe('bba78a2e-c117-52af-b25d-126702e8cf57');
  });
});

describe('getGlobalObjectContextCommandMenuItemUniversalIdentifier', () => {
  it('derives a deterministic id from the engineComponentKey within GLOBAL_OBJECT_CONTEXT', () => {
    expect(
      getGlobalObjectContextCommandMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        engineComponentKey: 'CREATE_NEW_RECORD',
      }),
    ).toBe('77fb3fcd-ee35-50ea-9c3c-ab95cef5e0e2');
  });
});

describe('getRecordSelectionCommandMenuItemUniversalIdentifier', () => {
  it('includes the target object when scoped to one', () => {
    expect(
      getRecordSelectionCommandMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        engineComponentKey: 'COMPOSE_EMAIL',
        objectUniversalIdentifier: OBJECT,
      }),
    ).toBe('dd10a2b1-229b-572a-a887-ea20e487cfd3');
  });

  it('omits the object for object-agnostic record-selection commands', () => {
    expect(
      getRecordSelectionCommandMenuItemUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        engineComponentKey: 'DELETE_RECORDS',
      }),
    ).toBe('36b20ed1-6172-5da5-9a21-58de9c8acb22');
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
