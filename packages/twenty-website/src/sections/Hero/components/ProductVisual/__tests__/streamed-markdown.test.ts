import {
  getVisibleLength,
  sliceVisibleParagraphs,
  type MarkdownSegment,
} from '../streamed-markdown';

const visibleCharCount = (paragraphs: MarkdownSegment[][]) =>
  paragraphs.reduce(
    (total, segments) =>
      total + segments.reduce((sum, segment) => sum + segment.text.length, 0),
    0,
  );

describe('getVisibleLength', () => {
  it('counts plain characters', () => {
    expect(getVisibleLength(['hello'])).toBe(5);
  });

  it('excludes the ** bold markers', () => {
    expect(getVisibleLength(['a**bold**c'])).toBe(6);
    expect(getVisibleLength(['**bold**'])).toBe(4);
  });

  it('still counts text after an unclosed marker', () => {
    expect(getVisibleLength(['a**b'])).toBe(2);
  });

  it('sums across paragraphs', () => {
    expect(getVisibleLength(['ab', 'cd'])).toBe(4);
    expect(getVisibleLength([''])).toBe(0);
  });
});

describe('sliceVisibleParagraphs', () => {
  it('returns nothing for a zero-length reveal', () => {
    expect(sliceVisibleParagraphs(['hello'], 0)).toEqual([]);
  });

  it('reveals plain text up to the visible length', () => {
    expect(sliceVisibleParagraphs(['hello'], 3)).toEqual([
      [{ bold: false, text: 'hel' }],
    ]);
    expect(sliceVisibleParagraphs(['hello'], 5)).toEqual([
      [{ bold: false, text: 'hello' }],
    ]);
  });

  it('splits plain and bold runs at full length', () => {
    expect(sliceVisibleParagraphs(['a**bold**c'], 6)).toEqual([
      [
        { bold: false, text: 'a' },
        { bold: true, text: 'bold' },
        { bold: false, text: 'c' },
      ],
    ]);
  });

  it('truncates inside a bold run', () => {
    expect(sliceVisibleParagraphs(['a**bold**c'], 3)).toEqual([
      [
        { bold: false, text: 'a' },
        { bold: true, text: 'bo' },
      ],
    ]);
  });

  it('stops before a bold run when the plain prefix fills the budget', () => {
    expect(sliceVisibleParagraphs(['a**bold**c'], 1)).toEqual([
      [{ bold: false, text: 'a' }],
    ]);
  });

  it('treats an unclosed marker as a trailing bold run', () => {
    expect(sliceVisibleParagraphs(['a**b'], 2)).toEqual([
      [
        { bold: false, text: 'a' },
        { bold: true, text: 'b' },
      ],
    ]);
  });

  it('flows the budget across paragraphs and drops untouched ones', () => {
    expect(sliceVisibleParagraphs(['ab', 'cd'], 3)).toEqual([
      [{ bold: false, text: 'ab' }],
      [{ bold: false, text: 'c' }],
    ]);
    expect(sliceVisibleParagraphs(['**x**', 'y'], 1)).toEqual([
      [{ bold: true, text: 'x' }],
    ]);
  });

  it('never reveals more visible characters than requested or available', () => {
    const paragraphs = ['Intro **bold** tail', 'second **line**'];
    const total = getVisibleLength(paragraphs);

    for (let length = 0; length <= total + 5; length += 1) {
      const revealed = visibleCharCount(
        sliceVisibleParagraphs(paragraphs, length),
      );

      expect(revealed).toBe(Math.min(length, total));
    }
  });
});
