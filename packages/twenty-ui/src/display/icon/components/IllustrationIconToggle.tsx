import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconToggleRaw from '@assets/icons/illustration-toggle.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconToggleProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconToggle = (props: IllustrationIconToggleProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconToggleRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
