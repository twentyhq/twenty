import { useTheme } from '@emotion/react';

import IllustrationIconUsersRaw from '@ui/display/icon/assets/illustration-users.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconUsersProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconUsers = (props: IllustrationIconUsersProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconUsersRaw
      height={size}
      width={size}
      fill={fill.grey}
      color={color.grey}
    />
  );
};
