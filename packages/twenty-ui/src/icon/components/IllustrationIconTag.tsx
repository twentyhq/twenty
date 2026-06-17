import { useContext } from 'react';

import IllustrationIconTagRaw from '@assets/icons/illustration-tag.svg?react';
import { IllustrationIconWrapper } from '@ui/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

type IllustrationIconTagProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconTag = (props: IllustrationIconTagProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconTagRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
