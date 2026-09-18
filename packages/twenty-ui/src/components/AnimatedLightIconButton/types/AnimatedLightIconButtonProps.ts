import { type LightIconButtonAccent } from '@ui/components/LightIconButton/types/LightIconButtonAccent';
import { type LightIconButtonSize } from '@ui/components/LightIconButton/types/LightIconButtonSize';
import { type IconComponent } from '@ui/icon';
import { type ComponentProps, type MouseEvent } from 'react';

export type AnimatedLightIconButtonProps = {
  className?: string;
  testId?: string;
  Icon?: IconComponent;
  title?: string;
  size?: LightIconButtonSize;
  accent?: LightIconButtonAccent;
  active?: boolean;
  disabled?: boolean;
  focus?: boolean;
  rotate?: number;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
} & Pick<ComponentProps<'button'>, 'aria-label' | 'title'>;
