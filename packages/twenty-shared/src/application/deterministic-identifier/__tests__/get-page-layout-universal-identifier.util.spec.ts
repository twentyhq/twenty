import {
  getPageLayoutUniversalIdentifier,
  getRecordPageLayoutUniversalIdentifier,
} from '@/application/deterministic-identifier/get-page-layout-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';

describe('getPageLayoutUniversalIdentifier', () => {
  it('derives a deterministic id from the layout name within its object', () => {
    expect(
      getPageLayoutUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
        name: 'My Dashboard',
      }),
    ).toBe('dd8a6bdb-4f8e-57c7-8a34-120d5e6430ae');
  });

  it('derives a deterministic id from the layout name alone when standalone', () => {
    expect(
      getPageLayoutUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        name: 'Standalone',
      }),
    ).toBe('d382c85c-204a-5648-a101-e65575c3a853');
  });
});

describe('getRecordPageLayoutUniversalIdentifier', () => {
  it('derives a deterministic id from the RECORD_PAGE role within its object', () => {
    expect(
      getRecordPageLayoutUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
      }),
    ).toBe('80289fa4-d714-5883-bd1d-bc59c7b9a1c2');
  });
});
