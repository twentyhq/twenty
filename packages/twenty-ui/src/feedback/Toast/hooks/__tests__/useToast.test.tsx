import { render, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { StrictMode } from 'react';
import { expect, it, vi } from 'vitest';

import { ToastContext } from '../../contexts/ToastContext';
import { ToasterLifecycleEffect } from '../../../Toaster/internal/ToasterLifecycleEffect';
import { toastLimitState } from '../../states/toastLimitState';
import { toastsState } from '../../states/toastsState';
import { useCompleteToastExit } from '../useCompleteToastExit';
import { useToast } from '../useToast';

const renderToastHooks = ({ hasToaster = true } = {}) => {
  const store = createStore();
  const hook = renderHook(
    () => ({ ...useToast(), ...useCompleteToastExit() }),
    {
      wrapper: ({ children }) => (
        <ToastContext.Provider value={store}>
          {hasToaster && <ToasterLifecycleEffect />}
          {children}
        </ToastContext.Provider>
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
  expect(store.get(toastsState)).toEqual([
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
  store.set(toastLimitState, 1);
  const listener = vi.fn();
  const onClose = vi.fn();
  store.sub(toastsState, listener);
  listener.mockClear();
  result.current.enqueueToast({ children: 'Saved', onClose });
  const snapshot = store.get(toastsState);
  listener.mockClear();

  expect(result.current.enqueueToast(undefined)).toBeUndefined();

  expect(store.get(toastsState)).toBe(snapshot);
  expect(listener).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it('retains a dismissed toast until its exit finishes and calls onClose once', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  const onClose = vi.fn();
  store.sub(toastsState, listener);
  listener.mockClear();
  const id = result.current.enqueueToast({ children: 'Saved', onClose });

  result.current.closeToast(id);
  const [closingToast] = store.get(toastsState);
  expect(closingToast.status).toBe('closing');
  expect(onClose).toHaveBeenCalledOnce();

  result.current.closeToast(id);
  result.current.closeToast();
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(2);

  result.current.completeToastExit(closingToast);
  expect(store.get(toastsState)).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(3);
});

it('deduplicates visible notifications without updating their content', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  store.sub(toastsState, listener);
  listener.mockClear();
  result.current.enqueueToast({
    id: 'saved',
    dedupeKey: 'record',
    children: 'Saved',
  });
  const snapshot = store.get(toastsState);

  expect(
    result.current.enqueueToast({ id: 'saved', children: 'Changed' }),
  ).toBe('saved');
  expect(
    result.current.enqueueToast({ dedupeKey: 'record', children: 'Changed' }),
  ).toBe('saved');
  expect(store.get(toastsState)).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});

it('counts only visible toasts toward the limit and evicts the oldest', () => {
  const { store, result } = renderToastHooks();
  store.set(toastLimitState, 2);
  const onFirstClose = vi.fn();
  const onSecondClose = vi.fn();
  result.current.enqueueToast({ id: 'first', onClose: onFirstClose });
  result.current.enqueueToast({ id: 'second', onClose: onSecondClose });
  result.current.closeToast('first');
  result.current.enqueueToast({ id: 'third' });
  expect(onSecondClose).not.toHaveBeenCalled();

  result.current.enqueueToast({ id: 'fourth' });
  expect(
    store
      .get(toastsState)
      .map(({ notification, status }) => [notification.id, status]),
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
  const onClose = vi.fn();
  result.current.enqueueToast({ id: 'first', dedupeKey: 'saved', onClose });
  result.current.enqueueToast({ id: 'second' });
  result.current.closeToast('first');
  const [firstExit] = store.get(toastsState);

  result.current.enqueueToast({
    id: 'first',
    dedupeKey: 'saved',
    children: 'Restored',
    onClose,
  });
  const restoredToasts = store.get(toastsState);
  expect(restoredToasts.map(({ notification }) => notification.id)).toEqual([
    'second',
    'first',
  ]);
  expect(restoredToasts[1].renderKey).not.toBe(firstExit.renderKey);
  result.current.completeToastExit(firstExit);
  expect(store.get(toastsState)[1].notification.children).toBe('Restored');

  result.current.closeToast('first');
  const snapshot = store.get(toastsState);
  result.current.completeToastExit(firstExit);
  expect(store.get(toastsState)).toBe(snapshot);
  result.current.completeToastExit(snapshot[1]);
  expect(
    store.get(toastsState).map(({ notification }) => notification.id),
  ).toEqual(['second']);
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('can restore a notification from its close callback', () => {
  const { store, result } = renderToastHooks();
  const onClose = vi.fn(() => {
    result.current.enqueueToast({ id: 'saved', children: 'Restored' });
  });
  result.current.enqueueToast({ id: 'saved', onClose });

  result.current.closeToast();

  expect(store.get(toastsState)).toEqual([
    {
      notification: { id: 'saved', children: 'Restored' },
      status: 'visible',
      renderKey: 1,
    },
  ]);
  expect(onClose).toHaveBeenCalledOnce();
});

it('preserves queue limits and distinct render keys when an eviction callback enqueues a toast', () => {
  const { store, result } = renderToastHooks();
  store.set(toastLimitState, 1);
  const onFirstClose = vi.fn(() => {
    result.current.enqueueToast({ id: 'third' });
  });
  const onSecondClose = vi.fn();
  result.current.enqueueToast({ id: 'first', onClose: onFirstClose });

  result.current.enqueueToast({ id: 'second', onClose: onSecondClose });

  expect(
    store.get(toastsState).map(({ notification, status, renderKey }) => ({
      id: notification.id,
      status,
      renderKey,
    })),
  ).toEqual([
    { id: 'first', status: 'closing', renderKey: 0 },
    { id: 'second', status: 'closing', renderKey: 1 },
    { id: 'third', status: 'visible', renderKey: 2 },
  ]);
  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).toHaveBeenCalledOnce();
});

it('removes dismissed notifications immediately without a viewport even with queue subscribers', () => {
  const { store, result } = renderToastHooks({ hasToaster: false });
  store.sub(toastsState, vi.fn());
  store.set(toastLimitState, 1);
  const onClose = vi.fn();
  result.current.enqueueToast({ id: 'first', onClose });
  result.current.enqueueToast({ id: 'second', onClose });
  expect(
    store.get(toastsState).map(({ notification }) => notification.id),
  ).toEqual(['second']);
  expect(onClose).toHaveBeenCalledOnce();

  result.current.closeToast();
  expect(store.get(toastsState)).toEqual([]);
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
  result.current.enqueueToast({ id: 'first', onClose });
  result.current.enqueueToast({ id: 'second' });
  result.current.closeToast('first');
  const closingSnapshot = store.get(toastsState);

  firstToaster.unmount();
  expect(store.get(toastsState)).toBe(closingSnapshot);
  secondToaster.unmount();
  expect(store.get(toastsState)).toEqual([
    { notification: { id: 'second' }, status: 'visible', renderKey: 1 },
  ]);
  mountToaster();
  expect(store.get(toastsState)).toHaveLength(1);
  expect(onClose).toHaveBeenCalledOnce();
});

it('ignores unknown dismissals and completion for visible notifications', () => {
  const { store, result } = renderToastHooks();
  const listener = vi.fn();
  store.sub(toastsState, listener);
  listener.mockClear();
  result.current.enqueueToast({ id: 'saved' });
  const snapshot = store.get(toastsState);

  result.current.closeToast('unknown');
  result.current.completeToastExit(snapshot[0]);

  expect(store.get(toastsState)).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});
