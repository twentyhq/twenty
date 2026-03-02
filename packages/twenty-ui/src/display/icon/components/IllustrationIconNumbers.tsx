import IllustrationIconNumbersRaw from '@assets/icons/illustration-numbers.svg?react';
import { useContext } from 'react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme';

type IllustrationIconNumbersProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconNumbers = (
  props: IllustrationIconNumbersProps,
) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconNumbersRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
