import { useTheme } from '@emotion/react';
import IllustrationIconNumbersRaw from '@ui/display/icon/assets/illustration-numbers.svg?react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconNumbersProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconNumbers = (
  props: IllustrationIconNumbersProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconNumbersRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
