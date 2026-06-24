import IllustrationIconStarRaw from '@assets/icons/illustration-star.svg?react';
import { IllustrationIconWrapper } from '@ui/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IllustrationIconStarProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconStar = (props: IllustrationIconStarProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return (
    <IllustrationIconWrapper>
      <IllustrationIconStarRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
