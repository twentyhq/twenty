import { addPartnerToAppUrl } from './add-partner-to-app-url';

describe('addPartnerToAppUrl', () => {
  it('adds the partner to an app link', () => {
    expect(addPartnerToAppUrl('https://app.twenty.com/welcome', 'acme')).toBe(
      'https://app.twenty.com/welcome?partner=acme',
    );
  });

  it('keeps the parameters already on the link', () => {
    expect(
      addPartnerToAppUrl(
        'https://app.twenty.com/?returnToPath=%2Fsettings%2Fapplications',
        'acme',
      ),
    ).toBe(
      'https://app.twenty.com/?returnToPath=%2Fsettings%2Fapplications&partner=acme',
    );
  });

  it.each([
    'https://twenty.com/pricing',
    'https://docs.twenty.com/user-guide/introduction',
    'https://app.twenty.com.example.com/welcome',
    '/pricing',
  ])('leaves %s unchanged', (href) => {
    expect(addPartnerToAppUrl(href, 'acme')).toBe(href);
  });
});
