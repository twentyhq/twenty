import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { Loader } from '@ui/feedback/Loader/Loader';
import { themeCssVariables } from '@ui/theme-constants';
import { parseThemeColor } from '@ui/utilities';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Status.module.scss';
import { type StatusProps } from './types/StatusProps';

export const Status = ({
  children,
  color,
  loading = false,
  weight = 'regular',
  disabled = false,
  nativeButton = true,
  onClick,
  className,
  style,
  render,
  ref,
  ...props
}: StatusProps) => {
  const parsedColor = parseThemeColor(color);

  return useRender({
    defaultTagName: 'span',
    render: isDefined(onClick) ? (
      <ButtonPrimitive
        render={render}
        disabled={disabled}
        nativeButton={nativeButton}
      />
    ) : (
      render
    ),
    ref,
    state: { loading, weight, disabled, interactive: isDefined(onClick) },
    props: {
      ...props,
      onClick,
      className: clsx(styles.status, className),
      style: {
        '--tw-status-background': themeCssVariables.tag.background[parsedColor],
        '--tw-status-text-color': themeCssVariables.tag.text[parsedColor],
        ...style,
      } as CSSProperties,
      children: (
        <>
          <span className={styles.content}>{children}</span>
          {loading && <Loader color={color} />}
        </>
      ),
    },
  });
};
