import { type ShortcutDefinition } from '@ui/primitives/typography/Shortcut/types/ShortcutDefinition';
import { type Button as ButtonPrimitive } from '@base-ui/react/button';
import { type ComponentPropsWithRef, type ReactNode } from 'react';

import { type ButtonColor } from './ButtonColor';
import { type ButtonLoadingPosition } from './ButtonLoadingPosition';
import { type ButtonSize } from './ButtonSize';
import { type ButtonVariant } from './ButtonVariant';

export type ButtonProps = Omit<
  ComponentPropsWithRef<typeof ButtonPrimitive>,
  'color'
> &
  Omit<
    ComponentPropsWithRef<'a'>,
    keyof ComponentPropsWithRef<typeof ButtonPrimitive>
  > & {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    loadingPosition?: ButtonLoadingPosition;
    elevated?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    shortcut?: ShortcutDefinition;
    shortcutJoinLabel?: string;
  };
