import { nullifyEmptyRichTextDefaultValue } from '../nullify-empty-rich-text-default-value.util';

describe('nullifyEmptyRichTextDefaultValue', () => {
  it('returns null when both sub-fields are empty-string equivalents', () => {
    expect(
      nullifyEmptyRichTextDefaultValue({ blocknote: "''", markdown: '' }),
    ).toBeNull();
  });

  it('returns normalized object when blocknote has a value', () => {
    expect(
      nullifyEmptyRichTextDefaultValue({ blocknote: '[]', markdown: "''" }),
    ).toEqual({ blocknote: '[]', markdown: null });
  });
});
