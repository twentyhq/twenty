import { type ComponentPropsWithRef } from 'react';

import { type ShortcutFormatOptions } from './ShortcutFormatOptions';

export type ShortcutProps = Omit<
  ComponentPropsWithRef<'span'>,
  'children' | 'role'
> &
  ShortcutFormatOptions & {
    variant?: 'keys' | 'text' | 'button';
    visibility?: 'always' | 'desktop';
  };
