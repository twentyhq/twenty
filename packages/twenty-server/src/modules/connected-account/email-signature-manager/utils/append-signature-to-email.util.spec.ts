import { appendSignatureToEmail } from 'src/modules/connected-account/email-signature-manager/utils/append-signature-to-email.util';

describe('appendSignatureToEmail', () => {
  it('appends the signature to both the html and plain-text bodies', () => {
    const result = appendSignatureToEmail({
      html: '<p>Hello</p>',
      text: 'Hello',
      signature: '<div>Jane Doe</div>',
    });

    expect(result.html).toBe('<p>Hello</p><br><br><div>Jane Doe</div>');
    expect(result.text).toContain('Hello');
    expect(result.text).toContain('Jane Doe');
  });

  it('returns the bodies unchanged when the signature is empty', () => {
    const result = appendSignatureToEmail({
      html: '<p>Hello</p>',
      text: 'Hello',
      signature: '',
    });

    expect(result).toEqual({ html: '<p>Hello</p>', text: 'Hello' });
  });

  it('is idempotent when the signature is already present in the html', () => {
    const html = '<p>Hello</p><br><br><div>Jane Doe</div>';

    const result = appendSignatureToEmail({
      html,
      text: 'Hello',
      signature: '<div>Jane Doe</div>',
    });

    expect(result.html).toBe(html);
  });
});
