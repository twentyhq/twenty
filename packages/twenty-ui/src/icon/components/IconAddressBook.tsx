import IconAddressBookRaw from '@assets/icons/address-book.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconAddressBookProps = Pick<
  IconComponentProps,
  'size' | 'stroke' | 'color'
>;

export const IconAddressBook = (props: IconAddressBookProps) => {
  const theme = useTheme();
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return (
    <IconAddressBookRaw
      data-twenty-icon=""
      height={size}
      width={size}
      stroke={props.color ?? 'currentColor'}
      strokeWidth={stroke}
    />
  );
};
