import {
  getFieldsWidgetViewUniversalIdentifier,
  getIndexViewUniversalIdentifier,
  getViewUniversalIdentifier,
} from '@/application/deterministic-identifier/get-view-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const OBJECT = '22222222-2222-4222-8222-222222222222';
const WIDGET = '88888888-8888-4888-8888-888888888888';

describe('getViewUniversalIdentifier', () => {
  it('derives a deterministic id from the view name within its object', () => {
    expect(
      getViewUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
        name: 'My View',
      }),
    ).toBe('125140c3-eca9-560d-9020-dad4ac1ebab6');
  });
});

describe('getIndexViewUniversalIdentifier', () => {
  it('derives a deterministic id from the stable INDEX view key within its object', () => {
    expect(
      getIndexViewUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        objectUniversalIdentifier: OBJECT,
      }),
    ).toBe('3803a536-0158-554c-bfb4-e5492323e57f');
  });
});

describe('getFieldsWidgetViewUniversalIdentifier', () => {
  it('derives a deterministic id from its 1:1 FIELDS page-layout widget', () => {
    expect(
      getFieldsWidgetViewUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        pageLayoutWidgetUniversalIdentifier: WIDGET,
      }),
    ).toBe('5f45a1bd-97df-56f7-a8ad-7839ef0045b5');
  });
});
