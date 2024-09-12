import { useTheme } from '@emotion/react';

import IllustrationIconUidRaw from '@ui/display/icon/assets/illustration-uid.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconUidProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconUid = (props: IllustrationIconUidProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconUidRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
