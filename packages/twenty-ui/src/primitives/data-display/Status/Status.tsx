import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { Loader } from '@ui/primitives/feedback/Loader/Loader';
import { themeCssVariables } from '@ui/theme';
import { parseThemeColor } from '@ui/utilities';

import styles from './Status.module.scss';
import { type StatusProps } from './types/StatusProps';

export const Status = ({
  children,
  color,
  loading = false,
  weight = 'regular',
  className,
  style,
  render,
  ref,
  ...props
}: StatusProps) => {
  const parsedColor = parseThemeColor(color);

  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    state: { loading, weight },
    props: {
      'aria-busy': loading || undefined,
      ...props,
      className: clsx(styles.status, className),
      style: {
        '--tw-status-background': themeCssVariables.tag.background[parsedColor],
        '--tw-status-text-color': themeCssVariables.tag.text[parsedColor],
        ...style,
      } as CSSProperties,
      children: (
        <>
          <span className={styles.content}>{children}</span>
          {loading && (
            <Loader color={color} aria-hidden="true" render={<span />} />
          )}
        </>
      ),
    },
  });
};
