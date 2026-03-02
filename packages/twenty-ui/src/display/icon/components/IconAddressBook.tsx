import IconAddressBookRaw from '@assets/icons/address-book.svg?react';
import { useContext } from 'react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IconAddressBookProps = Pick<
  IconComponentProps,
  'size' | 'stroke' | 'color'
>;

export const IconAddressBook = (props: IconAddressBookProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return (
    <IconAddressBookRaw
      height={size}
      width={size}
      stroke={props.color ?? 'currentColor'}
      strokeWidth={stroke}
    />
  );
};
