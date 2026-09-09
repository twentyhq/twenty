import { useRender } from '@base-ui/react/use-render';
import { useDirection } from '@base-ui/react/direction-provider';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

import { useToastContext } from '@ui/feedback/Toast/internal/useToastContext';
import { Toast } from '@ui/feedback/Toast/Toast';
import { useThemeContainer } from '@ui/theme-constants';
import { useIsMobile } from '@ui/utilities/responsive/hooks/useIsMobile';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Toaster.module.scss';
import { type ToasterProps } from './types/ToasterProps';

export const Toaster = ({
  container,
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
  const isMobile = useIsMobile();
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
        <AnimatePresence>
          {toasts.map(({ id, dedupeKey: _dedupeKey, ...toast }) => (
            <motion.div
              key={id}
              className={styles.item}
              initial={{ opacity: 0, y: isMobile ? -40 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isMobile ? -40 : 40 }}
              transition={{ duration: 0.5 }}
              layout
            >
              <Toast {...toast} id={id} onClose={() => store.close(id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      ),
    },
  });

  return isDefined(target) ? createPortal(element, target) : null;
};
