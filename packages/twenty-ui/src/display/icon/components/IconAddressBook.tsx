import IconAddressBookRaw from '@assets/icons/address-book.svg?react';
import { useTheme } from '@emotion/react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconAddressBookProps = IconComponentProps;

export const IconAddressBook = ({
  size,
  stroke,
  color,
}: IconAddressBookProps) => {
  const theme = useTheme();
  const iconSize = size ?? 24;
  const iconStroke = stroke ?? theme.icon.stroke.md;

  return (
    <IconAddressBookRaw
      height={iconSize}
      width={iconSize}
      stroke={color ?? 'currentColor'}
      strokeWidth={iconStroke}
    />
  );
};
