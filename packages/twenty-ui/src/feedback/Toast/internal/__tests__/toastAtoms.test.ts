import { createStore } from 'jotai';
import { expect, it, vi } from 'vitest';

import {
  closeToastAtom,
  completeToastExitAtom,
  enqueueToastAtom,
  toastStateAtom,
} from '../toastAtoms';

it('generates distinct ids for notifications added without one', () => {
  const store = createStore();

  const firstId = store.set(enqueueToastAtom, {
    children: 'First notification',
  });
  const secondId = store.set(enqueueToastAtom, {
    children: 'Second notification',
  });

  expect(firstId).toBeTruthy();
  expect(secondId).not.toBe(firstId);
  expect(store.get(toastStateAtom).toasts).toEqual([
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
  const store = createStore();
  store.set(toastStateAtom, (state) => ({ ...state, limit: 1 }));
  const listener = vi.fn();
  const onClose = vi.fn();
  store.sub(toastStateAtom, listener);
  listener.mockClear();
  store.set(enqueueToastAtom, { children: 'Saved', onClose });
  const snapshot = store.get(toastStateAtom).toasts;
  listener.mockClear();

  expect(store.set(enqueueToastAtom, undefined)).toBeUndefined();

  expect(store.get(toastStateAtom).toasts).toBe(snapshot);
  expect(listener).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it('retains a dismissed toast until its exit finishes and calls onClose once', () => {
  const store = createStore();
  const listener = vi.fn();
  const onClose = vi.fn();
  store.sub(toastStateAtom, listener);
  listener.mockClear();
  const id = store.set(enqueueToastAtom, { children: 'Saved', onClose });

  store.set(closeToastAtom, id);
  const [closingToast] = store.get(toastStateAtom).toasts;
  expect(closingToast.status).toBe('closing');
  expect(onClose).toHaveBeenCalledOnce();

  store.set(closeToastAtom, id);
  store.set(closeToastAtom);
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(2);

  store.set(completeToastExitAtom, closingToast);
  expect(store.get(toastStateAtom).toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(3);
});

it('deduplicates visible notifications without updating their content', () => {
  const store = createStore();
  const listener = vi.fn();
  store.sub(toastStateAtom, listener);
  listener.mockClear();
  store.set(enqueueToastAtom, {
    id: 'saved',
    dedupeKey: 'record',
    children: 'Saved',
  });
  const snapshot = store.get(toastStateAtom).toasts;

  expect(
    store.set(enqueueToastAtom, { id: 'saved', children: 'Changed' }),
  ).toBe('saved');
  expect(
    store.set(enqueueToastAtom, { dedupeKey: 'record', children: 'Changed' }),
  ).toBe('saved');
  expect(store.get(toastStateAtom).toasts).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});

it('counts only visible toasts toward the limit and evicts the oldest', () => {
  const store = createStore();
  store.set(toastStateAtom, (state) => ({ ...state, limit: 2 }));
  store.sub(toastStateAtom, vi.fn());
  const onFirstClose = vi.fn();
  const onSecondClose = vi.fn();
  store.set(enqueueToastAtom, { id: 'first', onClose: onFirstClose });
  store.set(enqueueToastAtom, { id: 'second', onClose: onSecondClose });
  store.set(closeToastAtom, 'first');
  store.set(enqueueToastAtom, { id: 'third' });
  expect(onSecondClose).not.toHaveBeenCalled();

  store.set(enqueueToastAtom, { id: 'fourth' });
  expect(
    store
      .get(toastStateAtom)
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
  const store = createStore();
  store.sub(toastStateAtom, vi.fn());
  const onClose = vi.fn();
  store.set(enqueueToastAtom, { id: 'first', dedupeKey: 'saved', onClose });
  store.set(enqueueToastAtom, { id: 'second' });
  store.set(closeToastAtom, 'first');
  const [firstExit] = store.get(toastStateAtom).toasts;

  store.set(enqueueToastAtom, {
    id: 'first',
    dedupeKey: 'saved',
    children: 'Restored',
    onClose,
  });
  const restoredToasts = store.get(toastStateAtom).toasts;
  expect(restoredToasts.map(({ notification }) => notification.id)).toEqual([
    'second',
    'first',
  ]);
  expect(restoredToasts[1].renderKey).not.toBe(firstExit.renderKey);
  store.set(completeToastExitAtom, firstExit);
  expect(store.get(toastStateAtom).toasts[1].notification.children).toBe(
    'Restored',
  );

  store.set(closeToastAtom, 'first');
  const snapshot = store.get(toastStateAtom).toasts;
  store.set(completeToastExitAtom, firstExit);
  expect(store.get(toastStateAtom).toasts).toBe(snapshot);
  store.set(completeToastExitAtom, snapshot[1]);
  expect(
    store.get(toastStateAtom).toasts.map(({ notification }) => notification.id),
  ).toEqual(['second']);
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('can restore a notification from its close callback', () => {
  const store = createStore();
  store.sub(toastStateAtom, vi.fn());
  const onClose = vi.fn(() => {
    store.set(enqueueToastAtom, { id: 'saved', children: 'Restored' });
  });
  store.set(enqueueToastAtom, { id: 'saved', onClose });

  store.set(closeToastAtom);

  expect(store.get(toastStateAtom).toasts).toEqual([
    {
      notification: { id: 'saved', children: 'Restored' },
      status: 'visible',
      renderKey: 1,
    },
  ]);
  expect(onClose).toHaveBeenCalledOnce();
});

it('removes dismissed notifications immediately without a viewport', () => {
  const store = createStore();
  store.set(toastStateAtom, (state) => ({ ...state, limit: 1 }));
  const onClose = vi.fn();
  store.set(enqueueToastAtom, { id: 'first', onClose });
  store.set(enqueueToastAtom, { id: 'second', onClose });
  expect(
    store.get(toastStateAtom).toasts.map(({ notification }) => notification.id),
  ).toEqual(['second']);
  expect(onClose).toHaveBeenCalledOnce();

  store.set(closeToastAtom);
  expect(store.get(toastStateAtom).toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('discards unfinished exits when the last viewport unmounts and keeps visible toasts', () => {
  const store = createStore();
  const unsubscribeFirst = store.sub(toastStateAtom, vi.fn());
  const unsubscribeSecond = store.sub(toastStateAtom, vi.fn());
  const onClose = vi.fn();
  store.set(enqueueToastAtom, { id: 'first', onClose });
  store.set(enqueueToastAtom, { id: 'second' });
  store.set(closeToastAtom, 'first');
  const closingSnapshot = store.get(toastStateAtom).toasts;

  unsubscribeFirst();
  expect(store.get(toastStateAtom).toasts).toBe(closingSnapshot);
  unsubscribeSecond();
  expect(store.get(toastStateAtom).toasts).toEqual([
    { notification: { id: 'second' }, status: 'visible', renderKey: 1 },
  ]);
  store.sub(toastStateAtom, vi.fn());
  expect(store.get(toastStateAtom).toasts).toHaveLength(1);
  expect(onClose).toHaveBeenCalledOnce();
});

it('ignores unknown dismissals and completion for visible notifications', () => {
  const store = createStore();
  const listener = vi.fn();
  store.sub(toastStateAtom, listener);
  listener.mockClear();
  store.set(enqueueToastAtom, { id: 'saved' });
  const snapshot = store.get(toastStateAtom).toasts;

  store.set(closeToastAtom, 'unknown');
  store.set(completeToastExitAtom, snapshot[0]);

  expect(store.get(toastStateAtom).toasts).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});
