import { type ComponentPropsWithRef, type ReactElement, type Ref } from 'react';

import { type Popover } from '@ui/primitives/surfaces/Popover/Popover';

export type OverflowingListProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children'
> &
  Pick<
    ComponentPropsWithRef<typeof Popover.Root>,
    'open' | 'defaultOpen' | 'onOpenChange' | 'actionsRef'
  > & {
    children: ReactElement[];
    showOverflowCount?: boolean;
    maxInlineCount?: number;
    overflowLabel?: string;
    triggerProps?: Omit<
      ComponentPropsWithRef<typeof Popover.Trigger>,
      'handle' | 'payload' | 'ref'
    > & { ref?: Ref<HTMLElement> };
    popupProps?: Omit<ComponentPropsWithRef<typeof Popover.Popup>, 'children'>;
  };
