import { useRender } from '@base-ui/react/use-render';
import { useDirection } from '@base-ui/react/direction-provider';
import { clsx } from 'clsx';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { useToastContext } from '@ui/feedback/Toast/internal/useToastContext';
import { useThemeContainer } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { ToasterItems } from './internal/ToasterItems';
import styles from './Toaster.module.scss';
import { type ToasterProps } from './types/ToasterProps';

export const Toaster = ({
  container,
  getToastProps,
  className,
  render,
  ref,
  ...props
}: ToasterProps) => {
  const { store } = useToastContext();
  const toasts = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const themeContainer = useThemeContainer();
  const direction = useDirection();
  const target =
    container === undefined
      ? (themeContainer ??
        (typeof document === 'undefined' ? null : document.body))
      : container;

  const element = useRender({
    render,
    ref,
    props: {
      role: 'region',
      dir: direction,
      'aria-label': 'Notifications',
      ...props,
      className: clsx(styles.root, className),
      children: (
        <ToasterItems
          toasts={toasts}
          getToastProps={getToastProps}
          onClose={store.close}
        />
      ),
    },
  });

  return isDefined(target) ? createPortal(element, target) : null;
};
