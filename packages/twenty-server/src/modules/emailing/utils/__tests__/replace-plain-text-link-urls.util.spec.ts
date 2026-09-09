import { replacePlainTextLinkUrls } from 'src/modules/emailing/utils/replace-plain-text-link-urls.util';

describe('replacePlainTextLinkUrls', () => {
  it('swaps every occurrence of a link in the text part', () => {
    const text =
      'Pricing [https://acme.com/pricing] and again https://acme.com/pricing';

    expect(
      replacePlainTextLinkUrls(
        text,
        new Map([['https://acme.com/pricing', '{{c_t_0}}']]),
      ),
    ).toBe('Pricing [{{c_t_0}}] and again {{c_t_0}}');
  });

  it('does not let a shorter link claim the start of a longer one', () => {
    const text = 'https://acme.com/a and https://acme.com/ab';

    expect(
      replacePlainTextLinkUrls(
        text,
        new Map([
          ['https://acme.com/a', '{{c_t_0}}'],
          ['https://acme.com/ab', '{{c_t_1}}'],
        ]),
      ),
    ).toBe('{{c_t_0}} and {{c_t_1}}');
  });
});
