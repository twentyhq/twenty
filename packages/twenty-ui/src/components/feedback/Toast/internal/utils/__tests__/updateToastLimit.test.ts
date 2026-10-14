import { expect, it, vi } from 'vitest';

import { createToastStore } from '../../stores/createToastStore';
import { type ToastEntry } from '../../types/ToastEntry';
import { dismissToasts } from '../dismissToasts';
import { updateToastInStore } from '../updateToastInStore';
import { updateToastLimit } from '../updateToastLimit';

const createToastEntry = ({
  id,
  onClose,
}: {
  id: string;
  onClose?: () => void;
}): ToastEntry => ({
  notification: { id, children: id, onClose },
  status: 'visible',
});

it('evicts the oldest visible notifications while preserving retained identity and order', () => {
  const store = createToastStore(4);
  const onFirstClose = vi.fn();
  const onSecondClose = vi.fn();
  const first = createToastEntry({ id: 'first', onClose: onFirstClose });
  const second = createToastEntry({ id: 'second', onClose: onSecondClose });
  const third = createToastEntry({ id: 'third' });
  const fourth = createToastEntry({ id: 'fourth' });
  const exiting: ToastEntry = {
    notification: { id: 'exiting', onClose: vi.fn() },
    status: 'closing',
  };
  store.set('mountedToasterCount', 1);
  store.set('toasts', [first, exiting, second, third, fourth]);

  updateToastLimit({ store, limit: 2 });

  expect(store.state.limit).toBe(2);
  expect(store.state.toasts.map((entry) => entry.notification.id)).toEqual([
    'first',
    'exiting',
    'second',
    'third',
    'fourth',
  ]);
  expect(store.state.toasts.map((entry) => entry.status)).toEqual([
    'closing',
    'closing',
    'closing',
    'visible',
    'visible',
  ]);
  expect(store.state.toasts[1]).toBe(exiting);
  expect(store.state.toasts[3]).toBe(third);
  expect(store.state.toasts[4]).toBe(fourth);
  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).toHaveBeenCalledOnce();
  expect(exiting.notification.onClose).not.toHaveBeenCalled();
});

it('keeps live notifications and their identities when the limit grows', () => {
  const store = createToastStore(1);
  const onClose = vi.fn();
  const first = createToastEntry({ id: 'first', onClose });
  const toasts = [first];
  store.set('toasts', toasts);

  updateToastLimit({ store, limit: 4 });

  expect(store.state.limit).toBe(4);
  expect(store.state.toasts).toBe(toasts);
  expect(onClose).not.toHaveBeenCalled();
});

it('does not publish or repeat callbacks when the configured limit is unchanged', () => {
  const store = createToastStore(2);
  const listener = vi.fn();
  store.subscribe(listener);

  updateToastLimit({ store, limit: 2 });

  expect(listener).not.toHaveBeenCalled();
});

it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
  'rejects invalid limit %s without changing the store',
  (limit) => {
    const store = createToastStore(2);
    const first = createToastEntry({ id: 'first' });
    store.set('toasts', [first]);
    const snapshot = store.state;
    const listener = vi.fn();
    store.subscribe(listener);

    expect(() => updateToastLimit({ store, limit })).toThrow(
      'Toast limit must be a positive integer.',
    );
    expect(store.state).toBe(snapshot);
    expect(listener).not.toHaveBeenCalled();
  },
);

it('removes evicted notifications immediately when no renderer is mounted', () => {
  const store = createToastStore(3);
  const onClose = vi.fn();
  const first = createToastEntry({ id: 'first', onClose });
  const second = createToastEntry({ id: 'second' });
  const third = createToastEntry({ id: 'third' });
  store.set('toasts', [first, second, third]);

  updateToastLimit({ store, limit: 2 });

  expect(store.state.toasts).toEqual([second, third]);
  expect(store.state.toasts[0]).toBe(second);
  expect(store.state.toasts[1]).toBe(third);
  expect(onClose).toHaveBeenCalledOnce();
});

it('preserves reentrant callback updates and enqueues without closing an evicted notification twice', () => {
  const store = createToastStore(3);
  store.set('mountedToasterCount', 1);
  const onSecondClose = vi.fn();
  const second = createToastEntry({ id: 'second', onClose: onSecondClose });
  const retained = createToastEntry({ id: 'retained' });
  const replacement = createToastEntry({ id: 'replacement' });
  const onFirstClose = vi.fn(() => {
    updateToastInStore({ store, id: 'retained', children: 'Updated' });
    updateToastInStore({ store, id: 'first', children: 'Revived' });
    dismissToasts({ store, toastsToClose: [second] });
    dismissToasts({
      store,
      toastsToClose: [store.state.toasts[2]!],
      nextToasts: [...store.state.toasts, replacement],
    });
  });
  const first = createToastEntry({ id: 'first', onClose: onFirstClose });
  store.set('toasts', [first, second, retained]);

  updateToastLimit({ store, limit: 1 });

  expect(onFirstClose).toHaveBeenCalledOnce();
  expect(onSecondClose).toHaveBeenCalledOnce();
  expect(store.state.toasts.map((entry) => entry.notification.id)).toEqual([
    'first',
    'second',
    'retained',
    'replacement',
  ]);
  expect(store.state.toasts[0]?.notification.children).toBe('first');
  expect(store.state.toasts[2]?.notification.children).toBe('Updated');
  expect(store.state.toasts[2]?.status).toBe('closing');
  expect(store.state.toasts[3]).toBe(replacement);
});
