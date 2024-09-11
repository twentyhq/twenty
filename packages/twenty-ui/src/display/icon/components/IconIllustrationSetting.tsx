import { useTheme } from '@emotion/react';

import IconIllustrationSettingRaw from '@ui/display/icon/assets/illustration-setting.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconIllustrationSettingProps = Pick<IconComponentProps, 'size'>;

export const IconIllustrationSetting = (
  props: IconIllustrationSettingProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const illustrationColors = theme.iconIllustration;

  return (
    <IconIllustrationSettingRaw
      height={size}
      width={size}
      fill={illustrationColors.fill}
      color={illustrationColors.color}
    />
  );
};
