import { act, render, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { ToastProvider } from '../ToastProvider';
import { ToastContext } from '../contexts/ToastContext';
import { useToast } from '../hooks/useToast';
import { useToastEntries } from '../hooks/useToastEntries';
import { createToastStore } from '../stores/createToastStore';

it.each([0, -1, 1.5])('rejects an invalid toast limit of %s', (limit) => {
  expect(() => render(<ToastProvider limit={limit} />)).toThrow(
    'Toast limit must be a positive integer.',
  );
});

it('isolates nested provider queues and deduplication', () => {
  const parentStore = createToastStore();
  parentStore.set('toasts', [
    {
      notification: { id: 'parent', children: 'Parent notification' },
      dedupeKey: 'saved',
      status: 'visible',
    },
  ]);
  const parentToasts = parentStore.state.toasts;
  const { result } = renderHook(
    () => ({ ...useToast(), toasts: useToastEntries() }),
    {
      wrapper: ({ children }) => (
        <ToastContext.Provider value={parentStore}>
          <ToastProvider>{children}</ToastProvider>
        </ToastContext.Provider>
      ),
    },
  );

  act(() => {
    result.current.enqueueToast({
      dedupeKey: 'saved',
      children: 'Child notification',
    });
  });

  expect(result.current.toasts).toHaveLength(1);
  expect(result.current.toasts[0]?.notification.children).toBe(
    'Child notification',
  );

  act(() => result.current.closeToast());

  expect(result.current.toasts).toEqual([]);
  expect(parentStore.state.toasts).toBe(parentToasts);
});

it('deduplicates consecutive enqueues and applies the provider limit synchronously', () => {
  const { result } = renderHook(() => useToast(), {
    wrapper: ({ children }) => (
      <ToastProvider limit={1}>{children}</ToastProvider>
    ),
  });
  const onClose = vi.fn();
  const { enqueueToast, closeToast } = result.current;

  const firstId: string = enqueueToast({ dedupeKey: 'saved', onClose });
  expect(enqueueToast({ dedupeKey: 'saved' })).toBe(firstId);
  expect(enqueueToast(undefined)).toBeUndefined();
  expect(onClose).not.toHaveBeenCalled();

  enqueueToast({ children: 'Next notification' });
  expect(onClose).toHaveBeenCalledOnce();
  closeToast(firstId);
  expect(onClose).toHaveBeenCalledOnce();
});
