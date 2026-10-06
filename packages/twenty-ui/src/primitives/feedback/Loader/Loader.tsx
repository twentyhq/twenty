import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { themeCssVariables } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type LoaderProps } from './types/LoaderProps';

import styles from './Loader.module.scss';

export const Loader = ({
  color,
  className,
  style,
  render,
  ref,
  children,
  ...props
}: LoaderProps) =>
  useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.container, className),
      style: {
        ...(isDefined(color) && {
          '--loader-color': themeCssVariables.tag.text[color],
        }),
        ...style,
      } as CSSProperties,
      children: (
        <>
          <span className={styles.dot} aria-hidden="true" />
          {children}
        </>
      ),
    },
  });
