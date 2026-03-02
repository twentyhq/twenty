import { useContext } from 'react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';

import IllustrationIconFileRaw from '@assets/icons/illustration-file.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IllustrationIconFileProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconFile = (props: IllustrationIconFileProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconFileRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
