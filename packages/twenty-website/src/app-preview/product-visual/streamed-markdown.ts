// Incremental "**bold**" rendering for the streamed AI answer. The stream
// target (how many characters to reveal) and the render (which characters
// are shown) both depend on one definition of a "visible character" —
// anything except the `**` markers — so the two can never drift.

type MarkdownSegment = {
  bold: boolean;
  text: string;
};

function getParagraphVisibleLength(text: string): number {
  let length = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '*' && text[index + 1] === '*') {
      index += 1;
      continue;
    }

    length += 1;
  }

  return length;
}

function getVisibleLength(paragraphs: string[]): number {
  return paragraphs.reduce(
    (total, paragraph) => total + getParagraphVisibleLength(paragraph),
    0,
  );
}

function sliceParagraph(
  text: string,
  visibleLength: number,
): { consumed: number; segments: MarkdownSegment[] } {
  const segments: MarkdownSegment[] = [];
  let visibleRemaining = visibleLength;
  let cursor = 0;

  while (cursor < text.length && visibleRemaining > 0) {
    const openIndex = text.indexOf('**', cursor);

    if (openIndex === -1) {
      const segment = text.slice(cursor, cursor + visibleRemaining);
      segments.push({ bold: false, text: segment });
      visibleRemaining -= segment.length;
      break;
    }

    if (openIndex > cursor) {
      const plainSegment = text.slice(cursor, openIndex);
      const visiblePlainSegment = plainSegment.slice(0, visibleRemaining);

      if (visiblePlainSegment.length > 0) {
        segments.push({ bold: false, text: visiblePlainSegment });
        visibleRemaining -= visiblePlainSegment.length;
      }

      if (visiblePlainSegment.length < plainSegment.length) {
        break;
      }
    }

    const closeIndex = text.indexOf('**', openIndex + 2);

    if (closeIndex === -1) {
      const trailingSegment = text.slice(
        openIndex + 2,
        openIndex + 2 + visibleRemaining,
      );

      if (trailingSegment.length > 0) {
        segments.push({ bold: true, text: trailingSegment });
        visibleRemaining -= trailingSegment.length;
      }

      break;
    }

    const boldSegment = text.slice(openIndex + 2, closeIndex);
    const visibleBoldSegment = boldSegment.slice(0, visibleRemaining);

    // Skip an empty run when the budget ends exactly at the marker.
    if (visibleBoldSegment.length > 0) {
      segments.push({ bold: true, text: visibleBoldSegment });
    }

    visibleRemaining -= visibleBoldSegment.length;

    if (visibleBoldSegment.length < boldSegment.length) {
      break;
    }

    cursor = closeIndex + 2;
  }

  return { consumed: visibleLength - visibleRemaining, segments };
}

// Reveal the first `visibleLength` visible characters across `paragraphs`,
// returning each non-empty paragraph as a run of bold/plain segments.
function sliceVisibleParagraphs(
  paragraphs: string[],
  visibleLength: number,
): MarkdownSegment[][] {
  const result: MarkdownSegment[][] = [];
  let visibleRemaining = visibleLength;

  for (const paragraph of paragraphs) {
    if (visibleRemaining <= 0) {
      break;
    }

    const { consumed, segments } = sliceParagraph(paragraph, visibleRemaining);

    if (segments.length > 0) {
      result.push(segments);
    }

    visibleRemaining -= consumed;
  }

  return result;
}

export const streamedMarkdown = { getVisibleLength, sliceVisibleParagraphs };
