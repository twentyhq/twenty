import { type Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';

export type AutocompletePopupProps = AutocompletePrimitive.Popup.Props &
  Pick<
    AutocompletePrimitive.Positioner.Props,
    | 'side'
    | 'align'
    | 'sideOffset'
    | 'alignOffset'
    | 'anchor'
    | 'collisionPadding'
  > & {
    width?: number | string;
    container?: AutocompletePrimitive.Portal.Props['container'];
  };
