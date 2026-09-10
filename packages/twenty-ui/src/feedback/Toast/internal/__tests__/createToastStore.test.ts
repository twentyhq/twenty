import { expect, it, vi } from 'vitest';

import { createToastStore } from '../createToastStore';

it('generates distinct ids for notifications added without one', () => {
  const store = createToastStore();

  const firstId = store.enqueueToast({ children: 'First notification' });
  const secondId = store.enqueueToast({ children: 'Second notification' });

  expect(firstId).toBeTruthy();
  expect(secondId).not.toBe(firstId);
  expect(store.getSnapshot()).toEqual([
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

it('rejects a limit that is not a positive integer', () => {
  expect(() => createToastStore({ limit: 0 })).toThrow();
  expect(() => createToastStore({ limit: 1.5 })).toThrow();
});

it('ignores undefined options without publishing or evicting a toast', () => {
  const store = createToastStore({ limit: 1 });
  const listener = vi.fn();
  const onClose = vi.fn();
  store.subscribe(listener);
  store.enqueueToast({ children: 'Saved', onClose });
  const snapshot = store.getSnapshot();
  listener.mockClear();

  expect(store.enqueueToast(undefined)).toBeUndefined();

  expect(store.getSnapshot()).toBe(snapshot);
  expect(listener).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it('retains a dismissed toast until its exit finishes and calls onClose once', () => {
  const store = createToastStore();
  const listener = vi.fn();
  const onClose = vi.fn();
  store.subscribe(listener);
  const id = store.enqueueToast({ children: 'Saved', onClose });

  store.close(id);
  const [closingToast] = store.getSnapshot();
  expect(closingToast.status).toBe('closing');
  expect(onClose).toHaveBeenCalledOnce();

  store.close(id);
  store.close();
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(2);

  store.completeExit(closingToast);
  expect(store.getSnapshot()).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  expect(listener).toHaveBeenCalledTimes(3);
});

it('deduplicates visible notifications without updating their content', () => {
  const store = createToastStore();
  const listener = vi.fn();
  store.subscribe(listener);
  store.enqueueToast({ id: 'saved', dedupeKey: 'record', children: 'Saved' });
  const snapshot = store.getSnapshot();

  expect(store.enqueueToast({ id: 'saved', children: 'Changed' })).toBe(
    'saved',
  );
  expect(store.enqueueToast({ dedupeKey: 'record', children: 'Changed' })).toBe(
    'saved',
  );
  expect(store.getSnapshot()).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});

it('counts only visible toasts toward the limit and evicts the oldest', () => {
  const store = createToastStore({ limit: 2 });
  store.subscribe(vi.fn());
  const onFirstClose = vi.fn();
  const onSecondClose = vi.fn();
  store.enqueueToast({ id: 'first', onClose: onFirstClose });
  store.enqueueToast({ id: 'second', onClose: onSecondClose });
  store.close('first');
  store.enqueueToast({ id: 'third' });
  expect(onSecondClose).not.toHaveBeenCalled();

  store.enqueueToast({ id: 'fourth' });
  expect(
    store
      .getSnapshot()
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
  const store = createToastStore();
  store.subscribe(vi.fn());
  const onClose = vi.fn();
  store.enqueueToast({ id: 'first', dedupeKey: 'saved', onClose });
  store.enqueueToast({ id: 'second' });
  store.close('first');
  const [firstExit] = store.getSnapshot();

  store.enqueueToast({
    id: 'first',
    dedupeKey: 'saved',
    children: 'Restored',
    onClose,
  });
  const restoredToasts = store.getSnapshot();
  expect(restoredToasts.map(({ notification }) => notification.id)).toEqual([
    'second',
    'first',
  ]);
  expect(restoredToasts[1].renderKey).not.toBe(firstExit.renderKey);
  store.completeExit(firstExit);
  expect(store.getSnapshot()[1].notification.children).toBe('Restored');

  store.close('first');
  const snapshot = store.getSnapshot();
  store.completeExit(firstExit);
  expect(store.getSnapshot()).toBe(snapshot);
  store.completeExit(snapshot[1]);
  expect(
    store.getSnapshot().map(({ notification }) => notification.id),
  ).toEqual(['second']);
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('can restore a notification from its close callback', () => {
  const store = createToastStore();
  store.subscribe(vi.fn());
  const onClose = vi.fn(() => {
    store.enqueueToast({ id: 'saved', children: 'Restored' });
  });
  store.enqueueToast({ id: 'saved', onClose });

  store.close();

  expect(store.getSnapshot()).toEqual([
    {
      notification: { id: 'saved', children: 'Restored' },
      status: 'visible',
      renderKey: 1,
    },
  ]);
  expect(onClose).toHaveBeenCalledOnce();
});

it('removes dismissed notifications immediately without a viewport', () => {
  const store = createToastStore({ limit: 1 });
  const onClose = vi.fn();
  store.enqueueToast({ id: 'first', onClose });
  store.enqueueToast({ id: 'second', onClose });
  expect(
    store.getSnapshot().map(({ notification }) => notification.id),
  ).toEqual(['second']);
  expect(onClose).toHaveBeenCalledOnce();

  store.close();
  expect(store.getSnapshot()).toEqual([]);
  expect(onClose).toHaveBeenCalledTimes(2);
});

it('discards unfinished exits when the last viewport unmounts and keeps visible toasts', () => {
  const store = createToastStore();
  const unsubscribeFirst = store.subscribe(vi.fn());
  const unsubscribeSecond = store.subscribe(vi.fn());
  const onClose = vi.fn();
  store.enqueueToast({ id: 'first', onClose });
  store.enqueueToast({ id: 'second' });
  store.close('first');
  const closingSnapshot = store.getSnapshot();

  unsubscribeFirst();
  expect(store.getSnapshot()).toBe(closingSnapshot);
  unsubscribeSecond();
  expect(store.getSnapshot()).toEqual([
    { notification: { id: 'second' }, status: 'visible', renderKey: 1 },
  ]);
  store.subscribe(vi.fn());
  expect(store.getSnapshot()).toHaveLength(1);
  expect(onClose).toHaveBeenCalledOnce();
});

it('ignores unknown dismissals and completion for visible notifications', () => {
  const store = createToastStore();
  const listener = vi.fn();
  store.subscribe(listener);
  store.enqueueToast({ id: 'saved' });
  const snapshot = store.getSnapshot();

  store.close('unknown');
  store.completeExit(snapshot[0]);

  expect(store.getSnapshot()).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
  expect(store.getServerSnapshot()).toEqual([]);
});
