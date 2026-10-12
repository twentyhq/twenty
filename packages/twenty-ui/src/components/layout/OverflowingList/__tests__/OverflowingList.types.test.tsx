import { type ComponentPropsWithRef, createRef } from 'react';
import { expectTypeOf, it } from 'vitest';

import { Button } from '@ui/primitives/input/Button/Button';
import { type PopoverRootProps } from '@ui/primitives/surfaces/Popover/types/PopoverRootProps';

import { OverflowingList } from '../OverflowingList';
import { type OverflowingListProps } from '../types/OverflowingListProps';

it('retains upstream open change details and native composition targets', () => {
  expectTypeOf<OverflowingListProps['onOpenChange']>().toEqualTypeOf<
    PopoverRootProps['onOpenChange']
  >();
  expectTypeOf<OverflowingListProps['ref']>().toEqualTypeOf<
    ComponentPropsWithRef<'div'>['ref']
  >();

  <OverflowingList
    open={false}
    defaultOpen
    onOpenChange={(open, details) => {
      expectTypeOf(open).toEqualTypeOf<boolean>();
      expectTypeOf(details).toEqualTypeOf<
        Parameters<NonNullable<PopoverRootProps['onOpenChange']>>[1]
      >();
      details.cancel();
      details.allowPropagation();
      details.preventUnmountOnClose();
    }}
    triggerProps={{
      ref: createRef<HTMLElement>(),
      render: <Button />,
      children: 'More items',
      onClick: (event) => {
        event.preventDefault();
      },
    }}
    popupProps={{
      ref: createRef<HTMLDivElement>(),
      render: <section />,
      initialFocus: false,
      finalFocus: createRef<HTMLButtonElement>(),
    }}
  >
    {[]}
  </OverflowingList>;
});
