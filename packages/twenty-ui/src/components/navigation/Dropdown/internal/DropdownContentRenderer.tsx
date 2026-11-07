import { type Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useRender } from '@base-ui/react/use-render';

import { type PopoverPopupProps } from '@ui/primitives/surfaces/Popover/types/PopoverPopupProps';

import { DropdownPlacementContext } from './DropdownPlacementContext';

type DropdownContentRendererProps = {
  props: useRender.ElementProps<'div'>;
  state: PopoverPrimitive.Popup.State;
  render?: PopoverPopupProps['render'];
};

const skipStateAttribute = () => null;

const POPUP_STATE_ATTRIBUTES_ALREADY_IN_PROPS: Record<
  keyof PopoverPrimitive.Popup.State,
  typeof skipStateAttribute
> = {
  open: skipStateAttribute,
  side: skipStateAttribute,
  align: skipStateAttribute,
  instant: skipStateAttribute,
  transitionStatus: skipStateAttribute,
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
    stateAttributesMapping: POPUP_STATE_ATTRIBUTES_ALREADY_IN_PROPS,
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
