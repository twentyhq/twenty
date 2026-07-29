import { getFieldsWidgetViewUniversalIdentifier } from '@/application/deterministic-identifier/get-fields-widget-view-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const WIDGET = '88888888-8888-4888-8888-888888888888';

describe('getFieldsWidgetViewUniversalIdentifier', () => {
  it('derives a deterministic id from its 1:1 FIELDS page-layout widget', () => {
    expect(
      getFieldsWidgetViewUniversalIdentifier({
        applicationUniversalIdentifier: APP,
        pageLayoutWidgetUniversalIdentifier: WIDGET,
      }),
    ).toBe('5f45a1bd-97df-56f7-a8ad-7839ef0045b5');
  });
});
