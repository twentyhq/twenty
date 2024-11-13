import { useTheme } from '@emotion/react';

import IllustrationIconSlashRaw from '@ui/display/icon/assets/illustration-slash.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconSlashProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconSlash = (props: IllustrationIconSlashProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color } = theme.IllustrationIcon;
  return (
    <IllustrationIconSlashRaw height={size} width={size} color={color.grey} />
  );
};
