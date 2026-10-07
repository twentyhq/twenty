import { type ShortcutDefinition } from '@ui/primitives/typography/Shortcut/types/ShortcutDefinition';
import { type Button as ButtonPrimitive } from '@base-ui/react/button';
import { type ComponentPropsWithRef, type ReactNode } from 'react';

import { type ButtonColor } from './ButtonColor';
import { type ButtonSize } from './ButtonSize';
import { type ButtonVariant } from './ButtonVariant';

export type ButtonProps = Omit<
  ButtonPrimitive.Props,
  'color' | 'nativeButton' | 'role'
> &
  Pick<ComponentPropsWithRef<'a'>, 'href' | 'target' | 'rel' | 'download'> & {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    displayChildrenWhenLoading?: boolean;
    progress?: number;
    elevated?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    shortcut?: ShortcutDefinition;
    shortcutJoinLabel?: string;
  };
