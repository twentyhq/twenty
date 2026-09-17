import { isTipTapBlocksShape } from '../is-tiptap-blocks-shape';

describe('isTipTapBlocksShape', () => {
  it('should detect a bare array containing a TipTap only block', () => {
    expect(
      isTipTapBlocksShape(
        JSON.stringify([
          { type: 'paragraph', content: [{ type: 'text', text: 'hello' }] },
          { type: 'bulletList', content: [{ type: 'listItem', content: [] }] },
        ]),
      ),
    ).toBe(true);
  });

  it('should detect a TipTap document', () => {
    expect(isTipTapBlocksShape(JSON.stringify({ type: 'doc', content: [] })));
  });

  it('should not claim a blocknote body carrying a mention', () => {
    expect(
      isTipTapBlocksShape(
        JSON.stringify([
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
        ]),
      ),
    ).toBe(false);
  });

  it('should not claim a blocknote body carrying a list', () => {
    expect(
      isTipTapBlocksShape(
        JSON.stringify([
          {
            id: 'b1',
            type: 'bulletListItem',
            props: {},
            children: [],
            content: [{ type: 'text', text: 'call the client', styles: {} }],
          },
        ]),
      ),
    ).toBe(false);
  });

  it('should not claim a blocknote table, whose content is not an array', () => {
    expect(
      isTipTapBlocksShape(
        JSON.stringify([
          {
            id: 'b1',
            type: 'table',
            props: {},
            children: [],
            content: { type: 'tableContent', rows: [] },
          },
        ]),
      ),
    ).toBe(false);
  });

  it('should not claim invalid json or an empty array', () => {
    expect(isTipTapBlocksShape('not json')).toBe(false);
    expect(isTipTapBlocksShape('[]')).toBe(false);
  });
});
