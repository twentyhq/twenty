import { useTheme } from '@emotion/react';

import IllustrationIconSettingRaw from '@ui/display/icon/assets/illustration-setting.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconSettingProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconSetting = (
  props: IllustrationIconSettingProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;

  return (
    <IllustrationIconSettingRaw
      height={size}
      width={size}
      fill={fill}
      color={color}
    />
  );
};
