import { useRender } from '@base-ui/react/use-render';
import { useDirection } from '@base-ui/react/direction-provider';
import { clsx } from 'clsx';
import { createPortal } from 'react-dom';

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
      children: <ToasterItems getToastProps={getToastProps} />,
    },
  });

  return isDefined(target) ? createPortal(element, target) : null;
};
