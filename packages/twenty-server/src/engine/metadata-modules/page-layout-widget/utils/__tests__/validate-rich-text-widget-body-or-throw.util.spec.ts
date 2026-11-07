import { PageLayoutWidgetException } from 'src/engine/metadata-modules/page-layout-widget/exceptions/page-layout-widget.exception';
import { validateRichTextWidgetBodyOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-rich-text-widget-body-or-throw.util';

describe('validateRichTextWidgetBodyOrThrow', () => {
  it('should accept a body holding a rich text document', () => {
    expect(() =>
      validateRichTextWidgetBodyOrThrow({
        markdown: 'Hello',
        tiptap: JSON.stringify({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
          ],
        }),
      }),
    ).not.toThrow();
  });

  it('should reject a body holding nodes a rich text widget cannot store', () => {
    expect(() =>
      validateRichTextWidgetBodyOrThrow({
        tiptap: JSON.stringify({
          type: 'doc',
          content: [{ type: 'button', attrs: { href: 'https://twenty.com' } }],
        }),
      }),
    ).toThrow(PageLayoutWidgetException);
  });

  it('should reject a body linking to a dangerous protocol', () => {
    expect(() =>
      validateRichTextWidgetBodyOrThrow({
        tiptap: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Click',
                  marks: [
                    { type: 'link', attrs: { href: 'javascript:alert(1)' } },
                  ],
                },
              ],
            },
          ],
        }),
      }),
    ).toThrow(/Dangerous URL protocol/);
  });
});
