import { render, renderHook } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { expect, it, vi } from 'vitest';

import { ToasterLifecycleEffect } from '../../../Toaster/internal/ToasterLifecycleEffect';
import { ToastContext } from '../../contexts/ToastContext';
import { createToastStore } from '../../stores/createToastStore';
import { completeToastExit } from '../../utils/completeToastExit';
import { useToast } from '../useToast';

const renderToastHooks = ({ hasToaster = true } = {}) => {
  const store = createToastStore();
  const hook = renderHook(() => useToast(), {
    wrapper: ({ children }) => (
      <ToastContext.Provider value={store}>
        {hasToaster && <ToasterLifecycleEffect />}
        {children}
      </ToastContext.Provider>
    ),
  });

  return { store, ...hook };
};

it('does not repeat an enqueue effect when its consumer rerenders', () => {
  const store = createToastStore();
  const { rerender } = renderHook(
    () => {
      const { enqueueToast } = useToast();

      useEffect(() => {
        enqueueToast({ children: 'Saved' });
      }, [enqueueToast]);
    },
    {
      wrapper: ({ children }) => (
        <ToastContext.Provider value={store}>{children}</ToastContext.Provider>
      ),
    },
  );

  rerender();

  expect(
    store.state.toasts.map(({ notification }) => notification.children),
  ).toEqual(['Saved']);
});

it('generates distinct ids for each new notification', () => {
  const { store, result } = renderToastHooks();

  const firstId = result.current.enqueueToast({
    children: 'First notification',
  });
  const secondId = result.current.enqueueToast({
    children: 'Second notification',
  });

  expect(firstId).toBeTruthy();
  expect(secondId).not.toBe(firstId);
  expect(store.state.toasts).toEqual([
    {
      notification: { id: firstId, children: 'First notification' },
      status: 'visible',
    },
    {
      notification: { id: secondId, children: 'Second notification' },
      status: 'visible',
    },
  ]);
});

it('ignores undefined options without publishing or evicting a toast', () => {
  const { store, result } = renderToastHooks();
  store.set('limit', 1);
  const listener = vi.fn();
  const onClose = vi.fn();
  store.subscribe(listener);
  result.current.enqueueToast({ children: 'Saved', onClose });
  const snapshot = store.state.toasts;
  listener.mockClear();

  expect(result.current.enqueueToast(undefined)).toBeUndefined();

  expect(store.state.toasts).toBe(snapshot);
  expect(listener).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it('retains a dismissed toast until its exit finishes and calls onClose once', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  const onClose = vi.fn();
  store.subscribe(listener);
  const id = result.current.enqueueToast({ children: 'Saved', onClose });

  result.current.closeToast(id);
  const [closingToast] = store.state.toasts;
  expect(closingToast.status).toBe('closing');
  expect(onClose).toHaveBeenCalledOnce();

  result.current.closeToast(id);
  result.current.closeToast();
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(2);

  completeToastExit({ store, toast: closingToast });
  expect(store.state.toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(3);
});

it('deduplicates visible notifications without updating their content', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  store.subscribe(listener);
  const id = result.current.enqueueToast({
    dedupeKey: 'record',
    children: 'Saved',
  });
  const snapshot = store.state.toasts;

  expect(
    result.current.enqueueToast({ dedupeKey: 'record', children: 'Changed' }),
  ).toBe(id);
  expect(store.state.toasts).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});

it('counts only visible toasts toward the limit and evicts the oldest', () => {
  const { store, result } = renderToastHooks();
  store.set('limit', 2);
  const onFirstClose = vi.fn();
  const onSecondClose = vi.fn();
  const firstId = result.current.enqueueToast({
    children: 'First',
    onClose: onFirstClose,
  });
  result.current.enqueueToast({ children: 'Second', onClose: onSecondClose });
  result.current.closeToast(firstId);
  result.current.enqueueToast({ children: 'Third' });
  expect(onSecondClose).not.toHaveBeenCalled();

  result.current.enqueueToast({ children: 'Fourth' });
  expect(
    store.state.toasts.map(({ notification, status }) => [
      notification.children,
      status,
    ]),
  ).toEqual([
    ['First', 'closing'],
    ['Second', 'closing'],
    ['Third', 'visible'],
    ['Fourth', 'visible'],
  ]);
  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).toHaveBeenCalledOnce();
});

it('reopens a dismissed toast with a new id and completes each exit independently', () => {
  const { store, result } = renderToastHooks();
  const onClose = vi.fn();
  const firstId = result.current.enqueueToast({ dedupeKey: 'saved', onClose });
  const secondId = result.current.enqueueToast({ children: 'Second' });
  result.current.closeToast(firstId);
  const [firstExit] = store.state.toasts;

  const restoredId = result.current.enqueueToast({
    dedupeKey: 'saved',
    children: 'Restored',
    onClose,
  });
  const restoredToasts = store.state.toasts;
  expect(restoredToasts.map(({ notification }) => notification.id)).toEqual([
    firstId,
    secondId,
    restoredId,
  ]);
  expect(restoredId).not.toBe(firstId);
  result.current.closeToast(firstId);
  expect(store.state.toasts).toBe(restoredToasts);
  completeToastExit({ store, toast: firstExit });
  expect(store.state.toasts[1].notification.children).toBe('Restored');

  result.current.closeToast(restoredId);
  const snapshot = store.state.toasts;
  completeToastExit({ store, toast: firstExit });
  expect(store.state.toasts).toBe(snapshot);
  completeToastExit({ store, toast: snapshot[1] });
  expect(store.state.toasts.map(({ notification }) => notification.id)).toEqual(
    [secondId],
  );
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('can restore a notification from its close callback', () => {
  const { store, result } = renderToastHooks();
  const onClose = vi.fn(() => {
    result.current.enqueueToast({ dedupeKey: 'saved', children: 'Restored' });
  });
  const firstId = result.current.enqueueToast({ dedupeKey: 'saved', onClose });

  result.current.closeToast();

  expect(store.state.toasts).toEqual([
    {
      notification: { id: firstId, onClose },
      dedupeKey: 'saved',
      status: 'closing',
    },
    {
      notification: { id: expect.any(String), children: 'Restored' },
      dedupeKey: 'saved',
      status: 'visible',
    },
  ]);
  expect(onClose).toHaveBeenCalledOnce();
});

it('preserves queue limits when an eviction callback enqueues a toast', () => {
  const { store, result } = renderToastHooks();
  store.set('limit', 1);
  const onFirstClose = vi.fn(() => {
    result.current.enqueueToast({ children: 'Third' });
  });
  const onSecondClose = vi.fn();
  result.current.enqueueToast({ children: 'First', onClose: onFirstClose });

  result.current.enqueueToast({ children: 'Second', onClose: onSecondClose });

  const toasts = store.state.toasts;

  expect(
    toasts.map(({ notification, status }) => ({
      children: notification.children,
      status,
    })),
  ).toEqual([
    { children: 'First', status: 'closing' },
    { children: 'Second', status: 'closing' },
    { children: 'Third', status: 'visible' },
  ]);
  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).toHaveBeenCalledOnce();
});

it('removes dismissed notifications immediately without a viewport even with queue subscribers', () => {
  const { store, result } = renderToastHooks({ hasToaster: false });
  store.subscribe(vi.fn());
  store.set('limit', 1);
  const onClose = vi.fn();
  result.current.enqueueToast({ children: 'First', onClose });
  const secondId = result.current.enqueueToast({ children: 'Second', onClose });
  expect(store.state.toasts.map(({ notification }) => notification.id)).toEqual(
    [secondId],
  );
  expect(onClose).toHaveBeenCalledOnce();

  result.current.closeToast();
  expect(store.state.toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('discards unfinished exits when the last viewport unmounts and keeps visible toasts', () => {
  const { store, result } = renderToastHooks({ hasToaster: false });
  const mountToaster = () =>
    render(
      <StrictMode>
        <ToastContext.Provider value={store}>
          <ToasterLifecycleEffect />
        </ToastContext.Provider>
      </StrictMode>,
    );
  const firstToaster = mountToaster();
  const secondToaster = mountToaster();
  const onClose = vi.fn();
  const firstId = result.current.enqueueToast({ children: 'First', onClose });
  result.current.enqueueToast({ children: 'Second' });
  result.current.closeToast(firstId);
  const closingSnapshot = store.state.toasts;

  firstToaster.unmount();
  expect(store.state.toasts).toBe(closingSnapshot);
  secondToaster.unmount();
  expect(store.state.toasts).toEqual([closingSnapshot[1]]);
  mountToaster();
  expect(store.state.toasts).toHaveLength(1);
  expect(onClose).toHaveBeenCalledOnce();
});

it('ignores unknown dismissals and completion for visible notifications', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  store.subscribe(listener);
  result.current.enqueueToast({ children: 'Saved' });
  const snapshot = store.state.toasts;

  result.current.closeToast('unknown');
  completeToastExit({ store, toast: snapshot[0] });

  expect(store.state.toasts).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});
