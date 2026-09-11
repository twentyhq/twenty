import { type useRender } from '@base-ui/react/use-render';
import {
  type HTMLAttributes,
  type MouseEventHandler,
  type RefAttributes,
} from 'react';

import { type ThemeColor } from '@ui/theme';

type StatusOwnProps = {
  color: ThemeColor;
  weight?: 'regular' | 'medium';
  disabled?: boolean;
  loading?: boolean;
};

type StatusStaticProps = Omit<
  useRender.ComponentProps<'span'>,
  'color' | 'onClick'
> & {
  onClick?: undefined;
  nativeButton?: true;
};

type StatusButtonProps = Omit<
  useRender.ComponentProps<'button'>,
  'color' | 'onClick'
> & {
  onClick: MouseEventHandler<HTMLButtonElement>;
  nativeButton?: true;
};

type StatusCustomProps = Omit<HTMLAttributes<HTMLElement>, 'color'> &
  RefAttributes<HTMLElement> & {
    nativeButton: false;
    render: NonNullable<useRender.ComponentProps<'span'>['render']>;
  };

export type StatusProps = StatusOwnProps &
  (StatusStaticProps | StatusButtonProps | StatusCustomProps);
