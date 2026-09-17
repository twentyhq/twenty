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
});
