import { type Store } from '@base-ui/utils/store';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { DEFAULT_TOAST_DURATION } from '../constants/DefaultToastDuration';
import { type ToastStoreState } from '../types/ToastStoreState';
import { completeToastExit } from './completeToastExit';
import { createToastCountdownStore } from './createToastCountdownStore';
import { dismissToasts } from './dismissToasts';
import { isToastVisible } from './isToastVisible';

type RendererConfiguration = {
  duration?: number;
  isProgress?: boolean;
  isPaused: boolean;
};

type NotificationLifecycle = {
  countdown: ReturnType<typeof createToastCountdownStore>;
  renderers: Map<symbol, RendererConfiguration>;
  pendingExits?: Set<symbol>;
  lastRenderer?: RendererConfiguration;
};

export const createToastLifecycle = (store: Store<ToastStoreState>) => {
  const notifications = new Map<string, NotificationLifecycle>();
  let isMounted = false;
  let isDisposed = false;
  let lifecycleRevision = 0;

  const getNotification = (id: string) => {
    const existingNotification = notifications.get(id);

    if (isDefined(existingNotification)) {
      return existingNotification;
    }

    const notification: NotificationLifecycle = {
      countdown: createToastCountdownStore({
        duration: DEFAULT_TOAST_DURATION,
        isPaused: true,
      }),
      renderers: new Map<symbol, RendererConfiguration>(),
    };
    notifications.set(id, notification);
    return notification;
  };

  const completeExit = (id: string) => {
    if (!isMounted) {
      return;
    }

    const lifecycle = notifications.get(id);

    if (
      !isDefined(lifecycle?.pendingExits) ||
      lifecycle.pendingExits.size > 0
    ) {
      return;
    }

    const toast = store.state.toasts.find(
      (entry) => entry.notification.id === id,
    );

    if (!isDefined(toast)) {
      return;
    }

    completeToastExit({ store, toast });
  };

  const synchronize = () => {
    for (const [id, lifecycle] of notifications) {
      const toast = store.state.toasts.find(
        (entry) => entry.notification.id === id,
      );

      if (!isDefined(toast)) {
        lifecycle.countdown.stop();
        notifications.delete(id);
        continue;
      }

      const firstRenderer =
        lifecycle.renderers.values().next().value ?? lifecycle.lastRenderer;
      lifecycle.lastRenderer = firstRenderer;
      const isPaused =
        !isMounted ||
        lifecycle.renderers.size === 0 ||
        [...lifecycle.renderers.values()].some((renderer) => renderer.isPaused);

      lifecycle.countdown.update({
        duration:
          firstRenderer?.duration ??
          toast.notification.duration ??
          DEFAULT_TOAST_DURATION,
        durationRevision: toast.durationRevision ?? 0,
        isProgress:
          firstRenderer?.isProgress ?? isDefined(toast.notification.progress),
        isPaused,
        isActive: toast.status === 'visible',
        onClose: () => {
          const currentToast = store.state.toasts.find(
            (entry) => entry.notification.id === id && isToastVisible(entry),
          );

          if (!isMounted || !isDefined(currentToast)) {
            return;
          }

          dismissToasts({ store, toastsToClose: [currentToast] });
        },
      });

      if (toast.status === 'visible') {
        continue;
      }

      lifecycle.pendingExits ??= new Set(lifecycle.renderers.keys());
      completeExit(id);
    }
  };

  const updateRenderer = ({
    id,
    key,
    configuration,
  }: {
    id: string;
    key: symbol;
    configuration: RendererConfiguration;
  }) => {
    const lifecycle = getNotification(id);

    if (!lifecycle.renderers.has(key)) {
      lifecycle.countdown.stop();
      lifecycle.pendingExits?.add(key);
    }

    lifecycle.renderers.set(key, configuration);
    synchronize();
    return lifecycle.countdown;
  };

  const removeRenderer = ({ id, key }: { id: string; key: symbol }) => {
    const lifecycle = notifications.get(id);

    if (!isDefined(lifecycle)) {
      return;
    }

    lifecycle.renderers.delete(key);
    lifecycle.pendingExits?.delete(key);
    synchronize();
  };

  const finishExit = ({ id, key }: { id: string; key: symbol }) => {
    notifications.get(id)?.pendingExits?.delete(key);
    completeExit(id);
  };

  const mount = () => {
    isMounted = true;
    isDisposed = false;
    lifecycleRevision += 1;
    const unsubscribe = store.subscribe(synchronize);
    synchronize();

    return () => {
      isMounted = false;
      unsubscribe();

      for (const lifecycle of notifications.values()) {
        lifecycle.countdown.stop();
      }

      const teardownRevision = ++lifecycleRevision;
      queueMicrotask(() => {
        if (isMounted || lifecycleRevision !== teardownRevision) {
          return;
        }

        isDisposed = true;
        notifications.clear();
        store.set('toasts', []);
      });
    };
  };

  return {
    mount,
    isActive: () => !isDisposed,
    getCountdown: (id: string) => notifications.get(id)?.countdown,
    updateRenderer,
    removeRenderer,
    finishExit,
  };
};
