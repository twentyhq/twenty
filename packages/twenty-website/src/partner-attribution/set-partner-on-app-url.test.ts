import { setPartnerOnAppUrl } from './set-partner-on-app-url';

describe('setPartnerOnAppUrl', () => {
  it('adds the partner to an app link', () => {
    expect(
      setPartnerOnAppUrl({
        href: 'https://app.twenty.com/welcome',
        partner: 'acme',
      }),
    ).toBe('https://app.twenty.com/welcome?partner=acme');
  });

  it('keeps the parameters already on the link', () => {
    expect(
      setPartnerOnAppUrl({
        href: 'https://app.twenty.com/?returnToPath=%2Fsettings%2Fapplications',
        partner: 'acme',
      }),
    ).toBe(
      'https://app.twenty.com/?returnToPath=%2Fsettings%2Fapplications&partner=acme',
    );
  });

  it('removes the partner from an app link when none is given', () => {
    expect(
      setPartnerOnAppUrl({
        href: 'https://app.twenty.com/welcome?partner=acme',
        partner: undefined,
      }),
    ).toBe('https://app.twenty.com/welcome');
  });

  it.each([
    'https://twenty.com/pricing',
    'https://docs.twenty.com/user-guide/introduction',
    'https://app.twenty.com.example.com/welcome',
    '/pricing',
  ])('leaves %s unchanged', (href) => {
    expect(setPartnerOnAppUrl({ href, partner: 'acme' })).toBe(href);
  });
});
