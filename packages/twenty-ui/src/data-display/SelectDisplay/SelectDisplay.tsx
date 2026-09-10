import { type IconComponent } from '@ui/icon/types/IconComponent';
import { Tag } from '@ui/data-display/Tag/Tag';
import { type ThemeColor } from '@ui/theme';

type SelectDisplayProps = {
  color: ThemeColor | 'transparent';
  label: string;
  Icon?: IconComponent;
  preventPadding?: boolean;
};

export const SelectDisplay = ({
  color,
  label,
  Icon,
  preventPadding,
}: SelectDisplayProps) => (
  <Tag
    preventShrink
    color={color}
    text={label}
    Icon={Icon}
    preventPadding={preventPadding}
  />
);
