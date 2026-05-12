import type { ReactNode } from 'react';

export type StreamingSegment =
  | { kind: 'text'; value: string; onReveal?: () => void }
  | {
      kind: 'node';
      value: ReactNode;
      length?: number;
      onReveal?: () => void;
    };
