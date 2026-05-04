import type { MessageDescriptor } from '@lingui/core';

export type MessageHeadingSegment = {
  fontFamily: 'sans' | 'serif' | 'mono';
  text: MessageDescriptor;
  fontWeight?: 'light' | 'regular' | 'medium';
  newLine?: boolean;
  lineBreakBefore?: boolean;
};
