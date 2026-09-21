import { convertHtmlToText } from 'src/modules/messaging/message-import-manager/utils/convert-html-to-text.util';

describe('convertHtmlToText', () => {
  it('should convert basic HTML to plain text', () => {
    expect(convertHtmlToText('<p>Hello world</p>')).toBe('Hello world');
  });

  it('should preserve newlines from block elements', () => {
    const result = convertHtmlToText('<p>First</p><p>Second</p>');

    expect(result).toContain('First');
    expect(result).toContain('Second');
  });

  it('should replace non-breaking spaces with regular spaces', () => {
    expect(convertHtmlToText('<p>Hello world</p>')).toBe('Hello world');
  });

  it('should collapse a non-breaking space entity into a regular space', () => {
    expect(convertHtmlToText('<p>Hello&nbsp;world</p>')).toBe('Hello world');
  });

  it('should return empty string for empty input', () => {
    expect(convertHtmlToText('')).toBe('');
  });

  it('should keep the body of an entirely-quoted message', () => {
    const result = convertHtmlToText(
      '<div class="gmail_quote"><p>Only quoted content here</p></div>',
    );

    expect(result).toBe('Only quoted content here');
  });

  it('should keep link text and destination', () => {
    expect(
      convertHtmlToText(
        '<p>See <a href="https://example.com">the docs</a></p>',
      ),
    ).toBe('See the docs [https://example.com]');
  });

  it('should keep table cell text', () => {
    expect(
      convertHtmlToText('<table><tr><td>Invoice</td><td>42</td></tr></table>'),
    ).toContain('Invoice');
  });

  it('should drop script tags and their contents', () => {
    expect(convertHtmlToText('<p>Hello</p><script>alert("xss")</script>')).toBe(
      'Hello',
    );
  });

  it('should drop style tags and their contents', () => {
    expect(convertHtmlToText('<style>.a{color:red}</style><p>Hello</p>')).toBe(
      'Hello',
    );
  });

  it('should drop head contents', () => {
    expect(
      convertHtmlToText(
        '<html><head><title>Secret</title></head><body><p>Hello</p></body></html>',
      ),
    ).toBe('Hello');
  });

  it('should drop noscript contents so tracking pixels do not leak into the body', () => {
    expect(
      convertHtmlToText(
        '<noscript><img src="https://tracker.example/p.gif"></noscript><p>Hello</p>',
      ),
    ).toBe('Hello');
  });

  it('should drop textarea contents', () => {
    expect(convertHtmlToText('<textarea>alert(1)</textarea><p>Hello</p>')).toBe(
      'Hello',
    );
  });

  it('should drop iframes, objects and embeds', () => {
    expect(
      convertHtmlToText(
        '<iframe src="https://evil.example/f"></iframe><object data="https://evil.example/o"></object><embed src="https://evil.example/e"><p>Hello</p>',
      ),
    ).toBe('Hello');
  });

  it('should drop event handler attributes', () => {
    expect(convertHtmlToText('<div onclick="steal()">Hello</div>')).toBe(
      'Hello',
    );
  });

  it('should drop javascript and data URLs while keeping the link text', () => {
    expect(convertHtmlToText('<a href="javascript:alert(1)">Click</a>')).toBe(
      'Click',
    );
    expect(
      convertHtmlToText(
        '<a href="data:text/html;base64,PHNjcmlwdD4=">Click</a>',
      ),
    ).toBe('Click');
  });

  it('should keep a word boundary where a quote container sat between inline text', () => {
    expect(
      convertHtmlToText(
        'Before text<div class="gmail_quote">Quoted body</div>After text',
      ),
    ).toBe('Before text\n\nAfter text');
  });

  it('should not let private use characters in the source act as quote markers', () => {
    expect(convertHtmlToText('<div>Real \uE000 text \uE001 kept</div>')).toBe(
      'Real text kept',
    );
  });
});
