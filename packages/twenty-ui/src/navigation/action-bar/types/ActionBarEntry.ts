import { IconComponent } from 'src/display';
import { MenuItemAccent } from 'src/navigation/menu-item/types/MenuItemAccent';

export type ActionBarEntry = {
  label: string;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  onClick?: () => void;
  subActions?: ActionBarEntry[];
};
