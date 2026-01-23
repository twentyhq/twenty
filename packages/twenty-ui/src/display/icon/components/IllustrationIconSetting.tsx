import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconSettingRaw from '@assets/icons/illustration-setting.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconSettingProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconSetting = (
  props: IllustrationIconSettingProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IllustrationIconWrapper>
      <IllustrationIconSettingRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
