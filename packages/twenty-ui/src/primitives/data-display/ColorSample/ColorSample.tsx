import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { type CSSProperties } from 'react';

import { themeCssVariables } from '@ui/theme';

import { type ColorSampleProps } from './types/ColorSampleProps';

import styles from './ColorSample.module.scss';

export const ColorSample = ({
  colorName,
  color,
  variant,
  className,
  style,
  render,
  ref,
  ...props
}: ColorSampleProps) =>
  useRender({
    defaultTagName: 'div',
    render,
    ref,
    props: {
      ...props,
      className: clsx(
        styles.root,
        variant === 'circle' && styles.circle,
        className,
      ),
      style: {
        '--color-sample-color':
          color ?? themeCssVariables.tag.background[colorName],
        '--color-sample-border-color': themeCssVariables.tag.text[colorName],
        ...style,
      } as CSSProperties,
    },
  });
