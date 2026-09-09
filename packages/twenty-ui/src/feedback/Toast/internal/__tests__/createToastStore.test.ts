import { afterEach, expect, it, vi } from 'vitest';

import { createToastStore } from '../createToastStore';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('queues distinct notifications when randomUUID is unavailable', () => {
  vi.stubGlobal('crypto', {
    getRandomValues: crypto.getRandomValues.bind(crypto),
  });
  const store = createToastStore();

  const firstId = store.add({ children: 'First notification' }, 3);
  const secondId = store.add({ children: 'Second notification' }, 3);

  expect(firstId).toBeTruthy();
  expect(secondId).not.toBe(firstId);
  expect(store.getSnapshot()).toEqual([
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

it('retains a dismissed toast until its exit finishes and calls onClose once', () => {
  const store = createToastStore();
  const listener = vi.fn();
  const onClose = vi.fn();
  store.subscribe(listener);
  const id = store.add({ children: 'Saved', onClose }, 3);

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
  store.add({ id: 'saved', dedupeKey: 'record', children: 'Saved' }, 3);
  const snapshot = store.getSnapshot();

  expect(store.add({ id: 'saved', children: 'Changed' }, 3)).toBe('saved');
  expect(store.add({ dedupeKey: 'record', children: 'Changed' }, 3)).toBe(
    'saved',
  );
  expect(store.getSnapshot()).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});

it('counts only visible toasts toward the limit and evicts the oldest', () => {
  const store = createToastStore();
  store.subscribe(vi.fn());
  const onFirstClose = vi.fn();
  const onSecondClose = vi.fn();
  store.add({ id: 'first', onClose: onFirstClose }, 2);
  store.add({ id: 'second', onClose: onSecondClose }, 2);
  store.close('first');
  store.add({ id: 'third' }, 2);
  expect(onSecondClose).not.toHaveBeenCalled();

  store.add({ id: 'fourth' }, 2);
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

it('appends a restored toast and ignores completion from an earlier exit', () => {
  const store = createToastStore();
  store.subscribe(vi.fn());
  const onClose = vi.fn();
  store.add({ id: 'first', dedupeKey: 'saved', onClose }, 3);
  store.add({ id: 'second' }, 3);
  store.close('first');
  const [firstExit] = store.getSnapshot();

  store.add(
    { id: 'first', dedupeKey: 'saved', children: 'Restored', onClose },
    3,
  );
  expect(
    store.getSnapshot().map(({ notification }) => notification.id),
  ).toEqual(['second', 'first']);
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
    store.add({ id: 'saved', children: 'Restored' }, 3);
  });
  store.add({ id: 'saved', onClose }, 3);

  store.close();

  expect(store.getSnapshot()).toEqual([
    { notification: { id: 'saved', children: 'Restored' }, status: 'visible' },
  ]);
  expect(onClose).toHaveBeenCalledOnce();
});

it('removes dismissed notifications immediately without a viewport', () => {
  const store = createToastStore();
  const onClose = vi.fn();
  store.add({ id: 'first', onClose }, 1);
  store.add({ id: 'second', onClose }, 1);
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
  store.add({ id: 'first', onClose }, 3);
  store.add({ id: 'second' }, 3);
  store.close('first');
  const closingSnapshot = store.getSnapshot();

  unsubscribeFirst();
  expect(store.getSnapshot()).toBe(closingSnapshot);
  unsubscribeSecond();
  expect(store.getSnapshot()).toEqual([
    { notification: { id: 'second' }, status: 'visible' },
  ]);
  store.subscribe(vi.fn());
  expect(store.getSnapshot()).toHaveLength(1);
  expect(onClose).toHaveBeenCalledOnce();
});

it('ignores unknown dismissals and completion for visible notifications', () => {
  const store = createToastStore();
  const listener = vi.fn();
  store.subscribe(listener);
  store.add({ id: 'saved' }, 3);
  const snapshot = store.getSnapshot();

  store.close('unknown');
  store.completeExit(snapshot[0]);

  expect(store.getSnapshot()).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
  expect(store.getServerSnapshot()).toEqual([]);
});
