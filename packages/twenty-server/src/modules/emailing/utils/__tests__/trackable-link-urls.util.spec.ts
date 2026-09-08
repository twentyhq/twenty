import { collectTrackableLinkUrls } from 'src/modules/emailing/utils/collect-trackable-link-urls.util';
import { decodeHtmlAttributeUrl } from 'src/modules/emailing/utils/decode-html-attribute-url.util';
import { replaceTrackableLinkUrls } from 'src/modules/emailing/utils/replace-trackable-link-urls.util';

describe('collectTrackableLinkUrls', () => {
  it('collects http and https links only once each', () => {
    const html = `
      <a href="https://acme.com/pricing">Pricing</a>
      <a href="http://acme.com/blog">Blog</a>
      <a href="https://acme.com/pricing">Pricing again</a>
    `;

    expect(collectTrackableLinkUrls(html)).toEqual([
      'https://acme.com/pricing',
      'http://acme.com/blog',
    ]);
  });

  it('ignores links that cannot be redirected through', () => {
    const html = `
      <a href="mailto:hi@acme.com">Mail</a>
      <a href="tel:+15550100">Call</a>
      <a href="#section">Anchor</a>
      <a href="/relative">Relative</a>
      <a href="cid:logo">Inline image</a>
    `;

    expect(collectTrackableLinkUrls(html)).toEqual([]);
  });

  it('ignores links still holding a batch substitution tag', () => {
    const html = `<a href="https://acme.com/{{v_u_0}}/welcome">Personalised</a>`;

    expect(collectTrackableLinkUrls(html)).toEqual([]);
  });

  it('decodes escaped ampersands so the stored url is the real destination', () => {
    const html = `<a href="https://acme.com/?a=1&amp;b=2">Link</a>`;

    expect(collectTrackableLinkUrls(html)).toEqual([
      'https://acme.com/?a=1&b=2',
    ]);
  });

  it('captures a url containing the other quote character', () => {
    const html = `<a href="https://acme.com/it's-here">Link</a>`;

    expect(collectTrackableLinkUrls(html)).toEqual([
      "https://acme.com/it's-here",
    ]);
  });

  it('ignores attributes that merely end with href', () => {
    const html = `
      <img data-href="https://acme.com/a">
      <use xlink:href="https://acme.com/b"/>
    `;

    expect(collectTrackableLinkUrls(html)).toEqual([]);
  });
});

describe('replaceTrackableLinkUrls', () => {
  it('swaps a matched link for its tracked url and keeps the quote style', () => {
    const html = `<a href='https://acme.com/pricing'>Pricing</a>`;

    const result = replaceTrackableLinkUrls(
      html,
      new Map([
        ['https://acme.com/pricing', 'https://lnk.acme.com/emailing/c/t'],
      ]),
    );

    expect(result).toBe(
      `<a href='https://lnk.acme.com/emailing/c/t'>Pricing</a>`,
    );
  });

  it('leaves links that have no replacement untouched', () => {
    const html = `<a href="https://acme.com/a">A</a><a href="mailto:hi@acme.com">B</a>`;

    expect(replaceTrackableLinkUrls(html, new Map())).toBe(html);
  });

  it('matches the escaped href that collecting produced', () => {
    const html = `<a href="https://acme.com/?a=1&amp;b=2">Link</a>`;
    const [url] = collectTrackableLinkUrls(html);

    const result = replaceTrackableLinkUrls(
      html,
      new Map([[url, 'https://lnk.acme.com/emailing/c/t']]),
    );

    expect(result).toBe(`<a href="https://lnk.acme.com/emailing/c/t">Link</a>`);
  });

  it('leaves attributes that merely end with href untouched', () => {
    const html = `<img data-href="https://acme.com/a">`;

    const result = replaceTrackableLinkUrls(
      html,
      new Map([['https://acme.com/a', 'https://lnk.acme.com/emailing/c/t']]),
    );

    expect(result).toBe(html);
  });
});

describe('decodeHtmlAttributeUrl', () => {
  it('decodes each entity in a single pass so a produced entity is not decoded again', () => {
    expect(decodeHtmlAttributeUrl('&amp;#39;')).toBe('&#39;');
  });

  it('decodes every supported entity', () => {
    expect(
      decodeHtmlAttributeUrl('&amp;&#38;&#x26;&#39;&#x27;&quot;&#34;&#x22;'),
    ).toBe(`&&&''"""`);
  });
});
