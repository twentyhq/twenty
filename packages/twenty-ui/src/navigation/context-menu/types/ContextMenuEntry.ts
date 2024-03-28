import { IconComponent } from 'src/display';
import { MenuItemAccent } from 'src/navigation/menu-item/types/MenuItemAccent';

export type ContextMenuEntry = {
  label: string;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  onClick: () => void;
};
