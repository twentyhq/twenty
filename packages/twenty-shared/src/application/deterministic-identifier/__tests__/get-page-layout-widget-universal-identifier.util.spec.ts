import { getPageLayoutWidgetUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-widget-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const TAB = '77777777-7777-4777-8777-777777777777';

describe('getPageLayoutWidgetUniversalIdentifier', () => {
  it('derives a deterministic id from the widget title within its tab', () => {
    expect(
      getPageLayoutWidgetUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        pageLayoutTabUniversalIdentifier: TAB,
        title: 'Fields',
      }),
    ).toBe('09cc205a-0cdf-52f0-9917-3ac5a75e69c5');
  });
});
