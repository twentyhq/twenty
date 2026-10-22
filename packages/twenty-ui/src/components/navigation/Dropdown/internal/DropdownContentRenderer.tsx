import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useRender } from '@base-ui/react/use-render';

import { type PopoverPopupProps } from '@ui/primitives/surfaces/Popover/types/PopoverPopupProps';

import { DropdownPlacementContext } from './DropdownPlacementContext';

type DropdownContentRendererProps = {
  props: useRender.ElementProps<'div'>;
  state: PopoverPrimitive.Popup.State;
  render?: PopoverPopupProps['render'];
};

export const DropdownContentRenderer = ({
  props,
  state,
  render,
}: DropdownContentRendererProps) => {
  const element = useRender({
    defaultTagName: 'div',
    props: { ...props },
    state: { ...state },
    render,
  });

  return (
    <DropdownPlacementContext.Provider
      value={{ side: state.side, align: state.align }}
    >
      {element}
    </DropdownPlacementContext.Provider>
  );
};
