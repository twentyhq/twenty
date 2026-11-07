import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { isValidElement } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type CardActionProps } from '../types/CardActionProps';

import styles from '../CardAction.module.scss';

export const CardAction = ({
  className,
  disabled = false,
  render,
  ref,
  ...props
}: CardActionProps) => {
  const isNativeButton =
    !isDefined(render) || (isValidElement(render) && render.type === 'button');

  return useRender({
    defaultTagName: 'button',
    render,
    ref,
    props: {
      ...(isNativeButton ? { type: 'button' } : undefined),
      disabled: disabled || undefined,
      ...props,
      className: clsx(styles.action, className),
      'data-card-action': '',
      'data-disabled': disabled || undefined,
    },
  });
};
