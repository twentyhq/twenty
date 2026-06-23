import { getPageLayoutTabUniversalIdentifier } from '@/application/deterministic-identifier/get-page-layout-tab-universal-identifier.util';

const APP = '11111111-1111-4111-8111-111111111111';
const PAGE_LAYOUT = '66666666-6666-4666-8666-666666666666';

describe('getPageLayoutTabUniversalIdentifier', () => {
  it('derives a deterministic id from the tab title within its page layout', () => {
    expect(
      getPageLayoutTabUniversalIdentifier({
        ownerApplicationUniversalIdentifier: APP,
        pageLayoutUniversalIdentifier: PAGE_LAYOUT,
        title: 'Home',
      }),
    ).toBe('f90464e0-2082-540b-8a02-1e59be4cadf4');
  });
});
