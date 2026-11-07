import { nullifyEmptyRichTextDefaultValue } from '../nullify-empty-rich-text-default-value.util';

describe('nullifyEmptyRichTextDefaultValue', () => {
  it('returns null when every sub-field is an empty-string equivalent', () => {
    expect(
      nullifyEmptyRichTextDefaultValue({
        blocknote: "''",
        markdown: '',
        tiptap: "''",
      }),
    ).toBeNull();
  });

  it('returns normalized object when blocknote has a value', () => {
    expect(
      nullifyEmptyRichTextDefaultValue({ blocknote: '[]', markdown: "''" }),
    ).toEqual({ blocknote: '[]', markdown: null, tiptap: null });
  });

  it('keeps a tiptap-only default value', () => {
    const tiptap = '{"type":"doc","content":[{"type":"paragraph"}]}';

    expect(
      nullifyEmptyRichTextDefaultValue({
        blocknote: null,
        markdown: "''",
        tiptap,
      }),
    ).toEqual({ blocknote: null, markdown: null, tiptap });
  });
});
