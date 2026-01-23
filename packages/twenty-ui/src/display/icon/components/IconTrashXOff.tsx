import { useTheme } from '@emotion/react';

import IconTrashXOffRaw from '@assets/icons/trash-x-off.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconTrashXOffProps = IconComponentProps;

export const IconTrashXOff = ({ size, stroke }: IconTrashXOffProps) => {
  const theme = useTheme();
  const iconSize = size ?? theme.icon.size.lg;
  const iconStroke = stroke ?? theme.icon.stroke.md;

  return (
    <IconTrashXOffRaw
      height={iconSize}
      width={iconSize}
      strokeWidth={iconStroke}
    />
  );
};
