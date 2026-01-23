import { useTheme } from '@emotion/react';

import IconTrashXOffRaw from '@assets/icons/trash-x-off.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconTrashXOffProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconTrashXOff = (props: IconTrashXOffProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return <IconTrashXOffRaw height={size} width={size} strokeWidth={stroke} />;
};
