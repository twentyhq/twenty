import { streamedMarkdown } from './streamed-markdown';

const { getVisibleLength, sliceVisibleParagraphs } = streamedMarkdown;

describe('streamedMarkdown.getVisibleLength', () => {
  it('should count characters without the bold markers', () => {
    expect(getVisibleLength(['Built a **Sales dashboard** now.'])).toBe(
      'Built a Sales dashboard now.'.length,
    );
  });

  it('should sum across paragraphs', () => {
    expect(getVisibleLength(['ab', '**cd**'])).toBe(4);
  });

  it('should return zero for no paragraphs', () => {
    expect(getVisibleLength([])).toBe(0);
  });
});

describe('streamedMarkdown.sliceVisibleParagraphs', () => {
  it('should reveal a prefix across plain and bold runs', () => {
    expect(sliceVisibleParagraphs(['ab **cd** ef'], 5)).toEqual([
      [
        { bold: false, text: 'ab ' },
        { bold: true, text: 'cd' },
      ],
    ]);
  });

  it('should stop mid-bold and omit later paragraphs', () => {
    expect(sliceVisibleParagraphs(['ab **cd**', 'ef'], 3)).toEqual([
      [{ bold: false, text: 'ab ' }],
    ]);
  });

  it('should skip the empty bold run when the budget ends at a marker', () => {
    const [paragraph] = sliceVisibleParagraphs(['ab **cd**'], 3);
    expect(paragraph.some((segment) => segment.text === '')).toBe(false);
  });

  it('should span paragraphs once the first is fully revealed', () => {
    expect(sliceVisibleParagraphs(['ab', 'cd'], 3)).toEqual([
      [{ bold: false, text: 'ab' }],
      [{ bold: false, text: 'c' }],
    ]);
  });

  it('should render every character at full length', () => {
    const paragraphs = [
      'Organized your open deals into a **pipeline board** grouped by stage.',
      'Drag a card to move a deal forward.',
    ];
    const revealed = sliceVisibleParagraphs(
      paragraphs,
      getVisibleLength(paragraphs),
    );
    const joined = revealed
      .map((segments) => segments.map((segment) => segment.text).join(''))
      .join('\n');
    expect(joined).toBe(
      'Organized your open deals into a pipeline board grouped by stage.\nDrag a card to move a deal forward.',
    );
  });
});
