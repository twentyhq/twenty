import { isFunction } from '@sniptt/guards';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { createToastStore } from '../../stores/createToastStore';
import { type ToastEntry } from '../../types/ToastEntry';
import { dismissToasts } from '../dismissToasts';
import { updateToastInStore } from '../updateToastInStore';

const RENDERER_CONFIGURATION = { isPaused: false };

const createStoreWithNotification = ({
  id = 'notification',
  onClose = vi.fn(),
}: {
  id?: string;
  onClose?: () => void;
} = {}) => {
  const store = createToastStore();
  const notification: ToastEntry = {
    notification: { id, children: 'Saved', duration: 1000, onClose },
    status: 'visible',
  };
  store.set('mountedToasterCount', 1);
  store.set('toasts', [notification]);

  return { store, notification, onClose };
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
});

afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('allocates a shared countdown only when a renderer is registered', () => {
  const { store } = createStoreWithNotification();

  expect(store.lifecycle.getCountdown('notification')).toBeUndefined();
  expect(store.lifecycle.getCountdown('notification')).toBeUndefined();
  expect(
    store.lifecycle.getCountdown('abandoned notification'),
  ).toBeUndefined();
  expect(vi.getTimerCount()).toBe(0);

  const firstClock = store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  const secondClock = store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });

  expect(store.lifecycle.getCountdown('notification')).toBe(firstClock);
  expect(secondClock).toBe(firstClock);
  expect(
    store.lifecycle.getCountdown('abandoned notification'),
  ).toBeUndefined();
  expect(vi.getTimerCount()).toBe(0);
});

it('shares one countdown across mirrors and dismisses with the latest callback once', () => {
  const { store, onClose } = createStoreWithNotification();
  const firstKey = Symbol();
  const secondKey = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(400);
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: secondKey,
    configuration: RENDERER_CONFIGURATION,
  });
  const updatedClose = vi.fn();
  updateToastInStore({
    store,
    id: 'notification',
    children: 'Updated',
    onClose: updatedClose,
  });

  expect(vi.getTimerCount()).toBe(1);
  vi.advanceTimersByTime(599);
  expect(updatedClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(updatedClose).toHaveBeenCalledOnce();
  expect(onClose).not.toHaveBeenCalled();
  expect(store.state.toasts[0]?.status).toBe('closing');
  vi.advanceTimersByTime(10_000);
  expect(updatedClose).toHaveBeenCalledOnce();
  stop();
});

it('keeps the shared clock paused until every mirror resumes', () => {
  const { store, onClose } = createStoreWithNotification();
  const firstKey = Symbol();
  const secondKey = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: RENDERER_CONFIGURATION,
  });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: secondKey,
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(400);
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: { ...RENDERER_CONFIGURATION, isPaused: true },
  });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: secondKey,
    configuration: { ...RENDERER_CONFIGURATION, isPaused: true },
  });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(10_000);
  expect(onClose).not.toHaveBeenCalled();
  expect(
    store.lifecycle.getCountdown('notification')?.getSnapshot(),
  ).toMatchObject({
    remainingDuration: 600,
    isPaused: true,
  });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: secondKey,
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('preserves remaining time while every mirror is detached and resumes on remount', () => {
  const { store, onClose } = createStoreWithNotification();
  const key = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key,
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(400);
  store.lifecycle.removeRenderer({ id: 'notification', key });
  vi.advanceTimersByTime(10_000);

  expect(onClose).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('uses the first registered mirror timing override until that mirror detaches', () => {
  const { store, onClose } = createStoreWithNotification();
  const firstKey = Symbol();
  const secondKey = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: { ...RENDERER_CONFIGURATION, duration: 0 },
  });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: secondKey,
    configuration: { ...RENDERER_CONFIGURATION, duration: 600 },
  });
  vi.advanceTimersByTime(10_000);
  expect(onClose).not.toHaveBeenCalled();

  store.lifecycle.removeRenderer({ id: 'notification', key: firstKey });
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('keeps notification clocks and callbacks isolated between providers', () => {
  const first = createStoreWithNotification();
  const second = createStoreWithNotification();
  const stopFirst = first.store.lifecycle.mount();
  const stopSecond = second.store.lifecycle.mount();
  first.store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  second.store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: { ...RENDERER_CONFIGURATION, duration: 0 },
  });

  vi.advanceTimersByTime(1000);

  expect(first.onClose).toHaveBeenCalledOnce();
  expect(second.onClose).not.toHaveBeenCalled();
  expect(second.store.state.toasts[0]).toBe(second.notification);
  stopFirst();
  stopSecond();
});

it('stops provider work without dismissing and resumes from the same remainder', () => {
  const { store, onClose } = createStoreWithNotification();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(400);
  stop();
  vi.advanceTimersByTime(10_000);
  expect(onClose).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);

  const stopRemounted = store.lifecycle.mount();
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onClose).toHaveBeenCalledOnce();
  stopRemounted();
});

it('retains cleanup updates when effect replay cancels provider disposal', async () => {
  const { store, onClose } = createStoreWithNotification();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(400);
  stop();

  expect(vi.getTimerCount()).toBe(0);
  updateToastInStore({
    store,
    id: 'notification',
    children: 'Updated during cleanup',
  });
  expect(store.state.toasts[0]?.notification.children).toBe(
    'Updated during cleanup',
  );

  const stopRemounted = store.lifecycle.mount();
  await Promise.resolve();
  expect(store.lifecycle.isActive()).toBe(true);
  expect(store.state.toasts[0]?.notification.children).toBe(
    'Updated during cleanup',
  );
  vi.advanceTimersByTime(599);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onClose).toHaveBeenCalledOnce();
  stopRemounted();
});

it('does not restart stopped provider work when an obsolete timer callback arrives', () => {
  const { store, onClose } = createStoreWithNotification();
  const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  const [timeoutCallback] = timeoutSpy.mock.calls[0]!;
  vi.advanceTimersByTime(400);
  stop();

  if (!isFunction(timeoutCallback)) {
    throw new Error('Expected a scheduled countdown callback.');
  }

  timeoutCallback();
  expect(vi.getTimerCount()).toBe(0);
  vi.advanceTimersByTime(10_000);
  expect(onClose).not.toHaveBeenCalled();
  timeoutSpy.mockRestore();
});

it('retains a closing notification until every registered mirror finishes or detaches', () => {
  const { store, notification, onClose } = createStoreWithNotification();
  const firstKey = Symbol();
  const secondKey = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: RENDERER_CONFIGURATION,
  });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: secondKey,
    configuration: RENDERER_CONFIGURATION,
  });

  dismissToasts({ store, toastsToClose: [notification] });
  store.lifecycle.finishExit({ id: 'notification', key: firstKey });
  store.lifecycle.finishExit({ id: 'notification', key: firstKey });
  store.lifecycle.finishExit({ id: 'notification', key: Symbol() });
  expect(store.state.toasts[0]?.status).toBe('closing');
  store.lifecycle.removeRenderer({ id: 'notification', key: secondKey });

  expect(store.state.toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  store.lifecycle.finishExit({ id: 'notification', key: secondKey });
  expect(store.state.toasts).toEqual([]);
  stop();
});

it('ignores an old mirror exit completion after the renderer is replaced', () => {
  const { store, notification, onClose } = createStoreWithNotification();
  const oldKey = Symbol();
  const currentKey = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: oldKey,
    configuration: RENDERER_CONFIGURATION,
  });
  store.lifecycle.removeRenderer({ id: 'notification', key: oldKey });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: currentKey,
    configuration: RENDERER_CONFIGURATION,
  });

  dismissToasts({ store, toastsToClose: [notification] });
  store.lifecycle.finishExit({ id: 'notification', key: oldKey });
  expect(store.state.toasts[0]?.status).toBe('closing');
  store.lifecycle.finishExit({ id: 'notification', key: currentKey });

  expect(store.state.toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('applies progress updates before a registered renderer refreshes', () => {
  const { store, onClose } = createStoreWithNotification();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(900);

  updateToastInStore({ store, id: 'notification', progress: 25 });
  vi.advanceTimersByTime(10_000);

  expect(vi.getTimerCount()).toBe(0);
  expect(onClose).not.toHaveBeenCalled();
  updateToastInStore({ store, id: 'notification', progress: undefined });
  vi.advanceTimersByTime(999);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('applies duration updates before a registered renderer refreshes', () => {
  const { store, onClose } = createStoreWithNotification();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  vi.advanceTimersByTime(900);

  updateToastInStore({ store, id: 'notification', duration: 600 });
  vi.advanceTimersByTime(599);

  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('retains a mirror duration override and its remainder while detached', () => {
  const { store, onClose } = createStoreWithNotification();
  const key = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key,
    configuration: { ...RENDERER_CONFIGURATION, duration: 600 },
  });
  vi.advanceTimersByTime(200);
  store.lifecycle.removeRenderer({ id: 'notification', key });
  vi.advanceTimersByTime(10_000);

  expect(onClose).not.toHaveBeenCalled();
  expect(
    store.lifecycle.getCountdown('notification')?.getSnapshot(),
  ).toMatchObject({
    duration: 600,
    remainingDuration: 400,
    isPaused: true,
  });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: { ...RENDERER_CONFIGURATION, duration: 600 },
  });
  vi.advanceTimersByTime(399);
  expect(onClose).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('defers late mirror exit completions while the provider is stopped', () => {
  const { store, notification, onClose } = createStoreWithNotification();
  const key = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key,
    configuration: RENDERER_CONFIGURATION,
  });
  dismissToasts({ store, toastsToClose: [notification] });
  const closingSnapshot = store.state.toasts;
  stop();

  store.lifecycle.finishExit({ id: 'notification', key });

  expect(store.state.toasts).toBe(closingSnapshot);
  expect(onClose).toHaveBeenCalledOnce();
  const stopRemounted = store.lifecycle.mount();
  expect(store.state.toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  stopRemounted();
});

it('waits for a mirror that joins while a notification is closing', () => {
  const { store, notification, onClose } = createStoreWithNotification();
  const firstKey = Symbol();
  const secondKey = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: RENDERER_CONFIGURATION,
  });
  dismissToasts({ store, toastsToClose: [notification] });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: secondKey,
    configuration: RENDERER_CONFIGURATION,
  });

  store.lifecycle.finishExit({ id: 'notification', key: firstKey });

  expect(store.state.toasts[0]?.status).toBe('closing');
  store.lifecycle.finishExit({ id: 'notification', key: secondKey });
  expect(store.state.toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('does not wait again for a completed mirror when its configuration refreshes', () => {
  const { store, notification, onClose } = createStoreWithNotification();
  const firstKey = Symbol();
  const secondKey = Symbol();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: RENDERER_CONFIGURATION,
  });
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: secondKey,
    configuration: RENDERER_CONFIGURATION,
  });
  dismissToasts({ store, toastsToClose: [notification] });
  store.lifecycle.finishExit({ id: 'notification', key: firstKey });

  store.lifecycle.updateRenderer({
    id: 'notification',
    key: firstKey,
    configuration: { ...RENDERER_CONFIGURATION, isPaused: true },
  });
  store.lifecycle.finishExit({ id: 'notification', key: secondKey });

  expect(store.state.toasts).toEqual([]);
  expect(onClose).toHaveBeenCalledOnce();
  stop();
});

it('discards notifications after final provider teardown without dismissal callbacks', async () => {
  const { store, onClose } = createStoreWithNotification();
  const stop = store.lifecycle.mount();
  store.lifecycle.updateRenderer({
    id: 'notification',
    key: Symbol(),
    configuration: RENDERER_CONFIGURATION,
  });
  stop();

  expect(vi.getTimerCount()).toBe(0);
  expect(onClose).not.toHaveBeenCalled();
  await Promise.resolve();

  expect(store.lifecycle.isActive()).toBe(false);
  const disposedSnapshot = store.state.toasts;
  updateToastInStore({ store, id: 'notification', children: 'Stale update' });
  expect(store.state.toasts).toBe(disposedSnapshot);
  expect(store.state.toasts).toEqual([]);
  vi.advanceTimersByTime(10_000);
  expect(onClose).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});
