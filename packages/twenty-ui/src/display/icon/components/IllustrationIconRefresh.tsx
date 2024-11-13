import { useTheme } from '@emotion/react';

import IllustrationIconRefreshRaw from '@ui/display/icon/assets/illustration-refresh.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconRefreshProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconRefresh = (
  props: IllustrationIconRefreshProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color } = theme.IllustrationIcon;
  return (
    <IllustrationIconRefreshRaw width={size} height={size} color={color.grey} />
  );
};
