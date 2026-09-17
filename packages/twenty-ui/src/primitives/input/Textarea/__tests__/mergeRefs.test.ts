import { isFunction } from '@sniptt/guards';
import { createRef } from 'react';
import { vi } from 'vitest';

import { mergeRefs } from '../internal/mergeRefs';

const runCleanup = (cleanup: unknown) => {
  expect(cleanup).toBeTypeOf('function');

  if (isFunction(cleanup)) {
    cleanup();
  }
};

describe('mergeRefs', () => {
  it('assigns the node to every ref and clears them on cleanup', () => {
    const objectRef = createRef<HTMLDivElement>();
    const callbackRef = vi.fn();
    const node = document.createElement('div');

    const cleanup = mergeRefs<HTMLDivElement>(
      objectRef,
      undefined,
      null,
      callbackRef,
    )(node);

    expect(objectRef.current).toBe(node);
    expect(callbackRef).toHaveBeenCalledWith(node);

    runCleanup(cleanup);

    expect(objectRef.current).toBeNull();
    expect(callbackRef).toHaveBeenLastCalledWith(null);
  });

  it('runs the cleanup returned by a callback ref instead of calling it with null', () => {
    const refCleanup = vi.fn();
    const callbackRef = vi.fn(() => refCleanup);
    const node = document.createElement('div');

    const cleanup = mergeRefs<HTMLDivElement>(callbackRef)(node);

    runCleanup(cleanup);

    expect(refCleanup).toHaveBeenCalledTimes(1);
    expect(callbackRef).toHaveBeenCalledTimes(1);
  });
});
