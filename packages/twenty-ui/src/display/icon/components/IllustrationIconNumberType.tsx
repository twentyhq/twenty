import { useTheme } from '@emotion/react';
import { IconEye } from '@ui/display';

import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconNumberTypeProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconNumberType = (
  props: IllustrationIconNumberTypeProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return <IconEye width={size} height={size} color={color.grey} />;
};
