import { type IconComponent } from '@ui/icon';
import { type ComponentProps, type MouseEvent } from 'react';
import { type LightIconButtonAccent } from './LightIconButtonAccent';
import { type LightIconButtonSize } from './LightIconButtonSize';

export type LightIconButtonProps = {
  className?: string;
  testId?: string;
  Icon?: IconComponent;
  title?: string;
  size?: LightIconButtonSize;
  accent?: LightIconButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'title'>;
