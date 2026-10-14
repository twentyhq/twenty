import { expect, it, vi } from 'vitest';

import { createToastStore } from '../../stores/createToastStore';
import { completeToastExit } from '../completeToastExit';
import { dismissToasts } from '../dismissToasts';
import { updateToastInStore } from '../updateToastInStore';

const createStoreWithToasts = () => {
  const store = createToastStore();
  const onClose = vi.fn();
  store.set('toasts', [
    {
      notification: {
        id: 'first',
        children: 'Uploading',
        description: 'Keep this description',
        status: 'info',
        duration: 6000,
        onClose,
      },
      dedupeKey: 'upload',
      status: 'visible',
    },
    { notification: { id: 'second', children: 'Second' }, status: 'visible' },
  ]);

  return { store, onClose };
};

it('patches a live notification without moving it or changing unrelated fields', () => {
  const { store, onClose } = createStoreWithToasts();
  const secondToast = store.state.toasts[1];

  updateToastInStore({
    store,
    id: 'first',
    children: 'Uploaded',
    status: 'success',
  });

  expect(store.state.toasts[0]).toEqual({
    notification: {
      id: 'first',
      children: 'Uploaded',
      description: 'Keep this description',
      status: 'success',
      duration: 6000,
      onClose,
    },
    dedupeKey: 'upload',
    status: 'visible',
  });
  expect(store.state.toasts[1]).toBe(secondToast);
  expect(onClose).not.toHaveBeenCalled();
});

it('applies successive patches to the latest notification and uses the latest close callback', () => {
  const { store, onClose } = createStoreWithToasts();
  const updatedClose = vi.fn();

  updateToastInStore({
    store,
    id: 'first',
    children: 'Updated',
    onClose: updatedClose,
  });
  updateToastInStore({
    store,
    id: 'first',
    description: 'New description',
    progress: 50,
  });

  expect(store.state.toasts[0]?.notification).toMatchObject({
    id: 'first',
    children: 'Updated',
    description: 'New description',
    progress: 50,
    onClose: updatedClose,
  });
  dismissToasts({ store, toastsToClose: [store.state.toasts[0]!] });
  expect(updatedClose).toHaveBeenCalledOnce();
  expect(onClose).not.toHaveBeenCalled();
});

it('clears optional fields explicitly while preserving omitted fields', () => {
  const { store, onClose } = createStoreWithToasts();

  updateToastInStore({
    store,
    id: 'first',
    children: null,
    description: null,
    status: undefined,
    duration: undefined,
    onClose: undefined,
  });

  expect(store.state.toasts[0]?.notification).toEqual({
    id: 'first',
    children: null,
    description: null,
    status: undefined,
    duration: undefined,
    onClose: undefined,
  });
  dismissToasts({ store, toastsToClose: [store.state.toasts[0]!] });
  expect(onClose).not.toHaveBeenCalled();
});

it('ignores unknown, exiting and removed IDs without publishing or calling callbacks', () => {
  const { store, onClose } = createStoreWithToasts();
  store.set('mountedToasterCount', 1);
  dismissToasts({ store, toastsToClose: [store.state.toasts[0]!] });
  const exitingToast = store.state.toasts[0]!;
  const snapshot = store.state.toasts;
  const listener = vi.fn();
  store.subscribe(listener);

  updateToastInStore({ store, id: 'missing', children: 'Missing' });
  updateToastInStore({
    store,
    id: 'first',
    children: 'Resurrected',
    onClose: vi.fn(),
  });

  expect(store.state.toasts).toBe(snapshot);
  expect(listener).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalledOnce();

  completeToastExit({ store, toast: exitingToast });
  const removedSnapshot = store.state.toasts;
  listener.mockClear();
  updateToastInStore({ store, id: 'first', children: 'Resurrected' });
  expect(store.state.toasts).toBe(removedSnapshot);
  expect(listener).not.toHaveBeenCalled();
});

it('does not publish empty patches but keeps explicit unchanged duration updates observable', () => {
  const { store } = createStoreWithToasts();
  const snapshot = store.state.toasts;
  const listener = vi.fn();
  store.subscribe(listener);

  updateToastInStore({ store, id: 'first' });
  expect(store.state.toasts).toBe(snapshot);
  expect(listener).not.toHaveBeenCalled();

  updateToastInStore({ store, id: 'first', duration: 6000 });
  expect(listener).toHaveBeenCalledOnce();
  expect(store.state.toasts[0]?.durationRevision).toBe(1);

  updateToastInStore({ store, id: 'first', duration: 6000 });
  expect(store.state.toasts[0]?.durationRevision).toBe(2);

  updateToastInStore({ store, id: 'first', children: 'Updated content' });
  expect(store.state.toasts[0]?.durationRevision).toBe(2);
});

it('restarts duration when an explicit undefined patch restores its default', () => {
  const { store } = createStoreWithToasts();

  updateToastInStore({ store, id: 'first', duration: undefined });
  expect(store.state.toasts[0]?.durationRevision).toBe(1);
  expect(store.state.toasts[0]?.notification.duration).toBeUndefined();

  updateToastInStore({ store, id: 'first', duration: undefined });
  expect(store.state.toasts[0]?.durationRevision).toBe(2);
});

it('preserves countdown restart operations when progress entry and exit are batched before rendering', () => {
  const { store } = createStoreWithToasts();

  updateToastInStore({ store, id: 'first', progress: 0 });
  updateToastInStore({ store, id: 'first', progress: 50 });
  expect(store.state.toasts[0]?.durationRevision).toBeUndefined();

  updateToastInStore({ store, id: 'first', progress: undefined });
  expect(store.state.toasts[0]?.durationRevision).toBe(1);
  expect(store.state.toasts[0]?.notification.progress).toBeUndefined();

  updateToastInStore({ store, id: 'first', progress: undefined });
  expect(store.state.toasts[0]?.durationRevision).toBe(1);

  updateToastInStore({ store, id: 'first', progress: 100 });
  updateToastInStore({
    store,
    id: 'first',
    progress: undefined,
    duration: 6000,
  });
  expect(store.state.toasts[0]?.durationRevision).toBe(2);
});
