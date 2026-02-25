import IconAddressBookRaw from '@assets/icons/address-book.svg?react';
import { useTheme } from '@emotion/react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

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
      height={size}
      width={size}
      stroke={props.color ?? 'currentColor'}
      strokeWidth={stroke}
    />
  );
};
