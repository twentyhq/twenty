import type { StreamEvent } from '../types/StreamEvent';

export const parseStreamLine = (line: string): StreamEvent | null => {
  try {
    return JSON.parse(line) as StreamEvent;
  } catch {
    return null;
  }
};
