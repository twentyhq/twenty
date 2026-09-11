import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { expect, it, vi } from 'vitest';

import { ToastContext } from '../../contexts/ToastContext';
import { toastState } from '../../states/toastState';
import { useCompleteToastExit } from '../useCompleteToastExit';
import { useToast } from '../useToast';

const renderToastHooks = () => {
  const store = createStore();
  const hook = renderHook(
    () => ({ ...useToast(), ...useCompleteToastExit() }),
    {
      wrapper: ({ children }) => (
        <ToastContext.Provider value={store}>{children}</ToastContext.Provider>
      ),
    },
  );

  return { store, ...hook };
};

it('generates distinct ids for notifications added without one', () => {
  const { store, result } = renderToastHooks();

  const firstId = result.current.enqueueToast({
    children: 'First notification',
  });
  const secondId = result.current.enqueueToast({
    children: 'Second notification',
  });

  expect(firstId).toBeTruthy();
  expect(secondId).not.toBe(firstId);
  expect(store.get(toastState).toasts).toEqual([
    {
      notification: { id: firstId, children: 'First notification' },
      status: 'visible',
      renderKey: 0,
    },
    {
      notification: { id: secondId, children: 'Second notification' },
      status: 'visible',
      renderKey: 1,
    },
  ]);
});

it('ignores undefined options without publishing or evicting a toast', () => {
  const { store, result } = renderToastHooks();
  store.set(toastState, (state) => ({ ...state, limit: 1 }));
  const listener = vi.fn();
  const onClose = vi.fn();
  store.sub(toastState, listener);
  listener.mockClear();
  result.current.enqueueToast({ children: 'Saved', onClose });
  const snapshot = store.get(toastState).toasts;
  listener.mockClear();

  expect(result.current.enqueueToast(undefined)).toBeUndefined();

  expect(store.get(toastState).toasts).toBe(snapshot);
  expect(listener).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it('retains a dismissed toast until its exit finishes and calls onClose once', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  const onClose = vi.fn();
  store.sub(toastState, listener);
  listener.mockClear();
  const id = result.current.enqueueToast({ children: 'Saved', onClose });

  result.current.close(id);
  const [closingToast] = store.get(toastState).toasts;
  expect(closingToast.status).toBe('closing');
  expect(onClose).toHaveBeenCalledOnce();

  result.current.close(id);
  result.current.close();
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(2);

  result.current.completeToastExit(closingToast);
  expect(store.get(toastState).toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(3);
});

it('deduplicates visible notifications without updating their content', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  store.sub(toastState, listener);
  listener.mockClear();
  result.current.enqueueToast({
    id: 'saved',
    dedupeKey: 'record',
    children: 'Saved',
  });
  const snapshot = store.get(toastState).toasts;

  expect(
    result.current.enqueueToast({ id: 'saved', children: 'Changed' }),
  ).toBe('saved');
  expect(
    result.current.enqueueToast({ dedupeKey: 'record', children: 'Changed' }),
  ).toBe('saved');
  expect(store.get(toastState).toasts).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});

it('counts only visible toasts toward the limit and evicts the oldest', () => {
  const { store, result } = renderToastHooks();
  store.set(toastState, (state) => ({ ...state, limit: 2 }));
  store.sub(toastState, vi.fn());
  const onFirstClose = vi.fn();
  const onSecondClose = vi.fn();
  result.current.enqueueToast({ id: 'first', onClose: onFirstClose });
  result.current.enqueueToast({ id: 'second', onClose: onSecondClose });
  result.current.close('first');
  result.current.enqueueToast({ id: 'third' });
  expect(onSecondClose).not.toHaveBeenCalled();

  result.current.enqueueToast({ id: 'fourth' });
  expect(
    store
      .get(toastState)
      .toasts.map(({ notification, status }) => [notification.id, status]),
  ).toEqual([
    ['first', 'closing'],
    ['second', 'closing'],
    ['third', 'visible'],
    ['fourth', 'visible'],
  ]);
  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).toHaveBeenCalledOnce();
});

it('appends a restored toast under a new render key and ignores completion from an earlier exit', () => {
  const { store, result } = renderToastHooks();
  store.sub(toastState, vi.fn());
  const onClose = vi.fn();
  result.current.enqueueToast({ id: 'first', dedupeKey: 'saved', onClose });
  result.current.enqueueToast({ id: 'second' });
  result.current.close('first');
  const [firstExit] = store.get(toastState).toasts;

  result.current.enqueueToast({
    id: 'first',
    dedupeKey: 'saved',
    children: 'Restored',
    onClose,
  });
  const restoredToasts = store.get(toastState).toasts;
  expect(restoredToasts.map(({ notification }) => notification.id)).toEqual([
    'second',
    'first',
  ]);
  expect(restoredToasts[1].renderKey).not.toBe(firstExit.renderKey);
  result.current.completeToastExit(firstExit);
  expect(store.get(toastState).toasts[1].notification.children).toBe(
    'Restored',
  );

  result.current.close('first');
  const snapshot = store.get(toastState).toasts;
  result.current.completeToastExit(firstExit);
  expect(store.get(toastState).toasts).toBe(snapshot);
  result.current.completeToastExit(snapshot[1]);
  expect(
    store.get(toastState).toasts.map(({ notification }) => notification.id),
  ).toEqual(['second']);
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('can restore a notification from its close callback', () => {
  const { store, result } = renderToastHooks();
  store.sub(toastState, vi.fn());
  const onClose = vi.fn(() => {
    result.current.enqueueToast({ id: 'saved', children: 'Restored' });
  });
  result.current.enqueueToast({ id: 'saved', onClose });

  result.current.close();

  expect(store.get(toastState).toasts).toEqual([
    {
      notification: { id: 'saved', children: 'Restored' },
      status: 'visible',
      renderKey: 1,
    },
  ]);
  expect(onClose).toHaveBeenCalledOnce();
});

it('removes dismissed notifications immediately without a viewport', () => {
  const { store, result } = renderToastHooks();
  store.set(toastState, (state) => ({ ...state, limit: 1 }));
  const onClose = vi.fn();
  result.current.enqueueToast({ id: 'first', onClose });
  result.current.enqueueToast({ id: 'second', onClose });
  expect(
    store.get(toastState).toasts.map(({ notification }) => notification.id),
  ).toEqual(['second']);
  expect(onClose).toHaveBeenCalledOnce();

  result.current.close();
  expect(store.get(toastState).toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('discards unfinished exits when the last viewport unmounts and keeps visible toasts', () => {
  const { store, result } = renderToastHooks();
  const unsubscribeFirst = store.sub(toastState, vi.fn());
  const unsubscribeSecond = store.sub(toastState, vi.fn());
  const onClose = vi.fn();
  result.current.enqueueToast({ id: 'first', onClose });
  result.current.enqueueToast({ id: 'second' });
  result.current.close('first');
  const closingSnapshot = store.get(toastState).toasts;

  unsubscribeFirst();
  expect(store.get(toastState).toasts).toBe(closingSnapshot);
  unsubscribeSecond();
  expect(store.get(toastState).toasts).toEqual([
    { notification: { id: 'second' }, status: 'visible', renderKey: 1 },
  ]);
  store.sub(toastState, vi.fn());
  expect(store.get(toastState).toasts).toHaveLength(1);
  expect(onClose).toHaveBeenCalledOnce();
});

it('ignores unknown dismissals and completion for visible notifications', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  store.sub(toastState, listener);
  listener.mockClear();
  result.current.enqueueToast({ id: 'saved' });
  const snapshot = store.get(toastState).toasts;

  result.current.close('unknown');
  result.current.completeToastExit(snapshot[0]);

  expect(store.get(toastState).toasts).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});
