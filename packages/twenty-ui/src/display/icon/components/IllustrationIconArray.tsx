import IllustrationIconArrayRaw from '@assets/icons/illustration-array.svg?react';
import { useContext } from 'react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';
type IllustrationIconArrayProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconArray = (props: IllustrationIconArrayProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconArrayRaw
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
        height={size}
        width={size}
      />
    </IllustrationIconWrapper>
  );
};
