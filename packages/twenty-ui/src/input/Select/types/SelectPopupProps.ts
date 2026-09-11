import { type Select as SelectPrimitive } from '@base-ui/react/select';

export type SelectPopupProps = SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    | 'side'
    | 'align'
    | 'sideOffset'
    | 'alignOffset'
    | 'alignItemWithTrigger'
    | 'anchor'
  > & {
    /**
     * Element the popup is portaled into. Defaults to the theme's portal
     * container.
     */
    container?: SelectPrimitive.Portal.Props['container'];
  };
