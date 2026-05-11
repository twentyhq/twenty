import { isValidElement } from 'react';

import { renderStreamingSegments } from '../components/RenderStreamingSegments';
import type { StreamingSegment } from '../types/streaming-text-types';

const getRenderedText = (segment: unknown): string => {
  if (!isValidElement<{ children: string }>(segment)) {
    throw new Error('Expected a rendered React element.');
  }

  return segment.props.children;
};

describe('renderStreamingSegments', () => {
  it('partially reveals text segments by character count', () => {
    const rendered = renderStreamingSegments(
      [{ kind: 'text', value: 'Launch' }],
      3,
    );

    expect(rendered.map(getRenderedText)).toEqual(['Lau']);
  });

  it('waits until a node segment reaches its configured reveal length', () => {
    const segments: StreamingSegment[] = [
      { kind: 'text', value: 'A' },
      { kind: 'node', value: 'rocket', length: 3 },
      { kind: 'text', value: 'Z' },
    ];

    expect(renderStreamingSegments(segments, 3).map(getRenderedText)).toEqual([
      'A',
    ]);
    expect(renderStreamingSegments(segments, 4).map(getRenderedText)).toEqual([
      'A',
      'rocket',
    ]);
  });
});
