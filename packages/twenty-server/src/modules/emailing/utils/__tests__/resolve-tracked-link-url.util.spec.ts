import { resolveTrackedLinkUrl } from 'src/modules/emailing/utils/resolve-tracked-link-url.util';

describe('resolveTrackedLinkUrl', () => {
  it('substitutes the recipient value into a personalised link', () => {
    expect(
      resolveTrackedLinkUrl({
        urlTemplate: 'https://acme.com/demo?u={{v_u_0}}',
        replacements: { v_u_0: 'ada%40acme.com' },
      }),
    ).toEqual({
      url: 'https://acme.com/demo?u=ada%40acme.com',
      isTrackable: true,
    });
  });

  it('leaves a static link untouched', () => {
    expect(
      resolveTrackedLinkUrl({
        urlTemplate: 'https://acme.com/pricing',
        replacements: {},
      }),
    ).toEqual({ url: 'https://acme.com/pricing', isTrackable: true });
  });

  it('marks a link that no longer parses as untrackable instead of failing', () => {
    expect(
      resolveTrackedLinkUrl({
        urlTemplate: 'https://{{v_u_0}}',
        replacements: { v_u_0: '' },
      }),
    ).toEqual({ url: 'https://', isTrackable: false });
  });
});
