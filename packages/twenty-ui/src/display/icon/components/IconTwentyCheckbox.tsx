import { useTheme } from '@emotion/react';

import IconTwentyCheckboxRaw from '@ui/display/icon/assets/checkbox.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconTwentyCheckboxProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconTwentyCheckbox = (props: IconTwentyCheckboxProps) => {
  const theme = useTheme();
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return (
    <IconTwentyCheckboxRaw height={size} width={size} strokeWidth={stroke} />
  );
};
