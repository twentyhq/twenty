import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { Children, cloneElement, isValidElement } from 'react';

import { type ButtonProps } from '@ui/input/Button/types/ButtonProps';

import styles from './ButtonGroup.module.scss';
import { type ButtonGroupProps } from './types/ButtonGroupProps';

export const ButtonGroup = ({
  className,
  children,
  variant,
  size,
  color,
  render,
  ref,
  ...props
}: ButtonGroupProps) =>
  useRender({
    render,
    ref,
    props: {
      role: 'group',
      ...props,
      className: clsx(styles.container, className),
      children: Children.map(children, (child) => {
        if (!isValidElement<ButtonProps>(child)) {
          return child;
        }
        return cloneElement(child, {
          variant: variant ?? child.props.variant,
          color: color ?? child.props.color,
          size: size ?? child.props.size,
        });
      }),
    },
  });
