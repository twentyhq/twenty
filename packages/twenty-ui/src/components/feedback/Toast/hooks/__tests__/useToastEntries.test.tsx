import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { expect, it, vi } from 'vitest';

import { ToastContext } from '../../contexts/ToastContext';
import { createToastStore } from '../../stores/createToastStore';
import { useToast } from '../useToast';
import { useToastEntries } from '../useToastEntries';

it('rerenders only toast subscribers when the toast list changes', () => {
  const store = createToastStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ToastContext.Provider value={store}>{children}</ToastContext.Provider>
  );
  const renderActions = vi.fn();
  const renderEntries = vi.fn();
  const actions = renderHook(
    () => {
      renderActions();
      return useToast();
    },
    { wrapper },
  );
  const entries = renderHook(
    () => {
      renderEntries();
      return useToastEntries();
    },
    { wrapper },
  );
  const initialActionRenderCount = renderActions.mock.calls.length;
  const initialEntriesRenderCount = renderEntries.mock.calls.length;

  act(() => store.set('mountedToasterCount', 1));

  expect(renderEntries).toHaveBeenCalledTimes(initialEntriesRenderCount);

  act(() => {
    actions.result.current.enqueueToast({ children: 'Saved' });
  });

  expect(entries.result.current[0]?.notification.children).toBe('Saved');
  expect(renderEntries.mock.calls.length).toBeGreaterThan(
    initialEntriesRenderCount,
  );
  expect(renderActions).toHaveBeenCalledTimes(initialActionRenderCount);
});
