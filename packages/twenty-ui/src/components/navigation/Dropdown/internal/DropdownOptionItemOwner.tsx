import { useRender } from '@base-ui/react/use-render';

import { type DropdownOptionItemState } from '../types/DropdownOptionItemState';

type DropdownOptionItemOwnerProps = useRender.ComponentProps<
  'button',
  DropdownOptionItemState
> & { state: DropdownOptionItemState };

export const DropdownOptionItemOwner = ({
  render,
  ref,
  state,
  ...props
}: DropdownOptionItemOwnerProps) =>
  useRender({ render, ref, state, defaultTagName: 'button', props });
