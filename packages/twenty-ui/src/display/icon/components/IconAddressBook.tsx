import IconAddressBookRaw from '@assets/icons/address-book.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
type IconAddressBookProps = Pick<
  IconComponentProps,
  'size' | 'stroke' | 'color'
>;

export const IconAddressBook = (props: IconAddressBookProps) => {
  const size = props.size ?? 24;
  const stroke =
    props.stroke ??
    resolveThemeVariableAsNumber(themeCssVariables.icon.stroke.md);

  return (
    <IconAddressBookRaw
      height={size}
      width={size}
      stroke={props.color ?? 'currentColor'}
      strokeWidth={stroke}
    />
  );
};
