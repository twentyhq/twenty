import { convertTipTapBlocksToMarkdown } from '../convert-tiptap-blocks-to-markdown';

describe('convertTipTapBlocksToMarkdown', () => {
  it('should convert a bare array of TipTap blocks', () => {
    const blocks = JSON.stringify([
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Checklist:' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'call the client' }],
              },
            ],
          },
        ],
      },
    ]);

    expect(convertTipTapBlocksToMarkdown(blocks)).toBe(
      'Checklist:\n\n- call the client',
    );
  });

  it('should convert a whole TipTap document', () => {
    const document = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
      ],
    });

    expect(convertTipTapBlocksToMarkdown(document)).toBe('hello');
  });

  it('should return undefined for invalid json', () => {
    expect(convertTipTapBlocksToMarkdown('not json')).toBeUndefined();
  });

  it('should return undefined for an empty array', () => {
    expect(convertTipTapBlocksToMarkdown('[]')).toBeUndefined();
  });

  it('should return undefined when a block is not a TipTap node', () => {
    expect(convertTipTapBlocksToMarkdown('[{"foo":"bar"}]')).toBeUndefined();
  });

  it('should leave a blocknote body carrying a mention alone', () => {
    const blocknoteBody = JSON.stringify([
      {
        id: 'b1',
        type: 'paragraph',
        props: {},
        children: [],
        content: [
          { type: 'text', text: 'Hello ', styles: {} },
          { type: 'mention', props: { label: 'John Doe' } },
        ],
      },
    ]);

    expect(convertTipTapBlocksToMarkdown(blocknoteBody)).toBeUndefined();
  });

  it('should leave a blocknote list alone', () => {
    const blocknoteBody = JSON.stringify([
      {
        id: 'b1',
        type: 'bulletListItem',
        props: {},
        children: [],
        content: [{ type: 'text', text: 'call the client', styles: {} }],
      },
    ]);

    expect(convertTipTapBlocksToMarkdown(blocknoteBody)).toBeUndefined();
  });

  it('should leave a blocknote table alone, whose content is not an array', () => {
    const blocknoteBody = JSON.stringify([
      {
        id: 'b1',
        type: 'table',
        props: {},
        children: [],
        content: { type: 'tableContent', rows: [] },
      },
    ]);

    expect(convertTipTapBlocksToMarkdown(blocknoteBody)).toBeUndefined();
  });
});
