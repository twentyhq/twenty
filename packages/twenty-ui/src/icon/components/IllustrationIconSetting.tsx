import IllustrationIconSettingRaw from '@assets/icons/illustration-setting.svg?react';
import { IllustrationIconWrapper } from '@ui/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

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
