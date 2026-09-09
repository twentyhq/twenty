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
    container?: SelectPrimitive.Portal.Props['container'];
  };
