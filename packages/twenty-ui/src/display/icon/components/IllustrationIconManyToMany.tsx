import IllustrationIconManyToManyRaw from '@assets/icons/illustration-many-to-many.svg?react';
import { useTheme } from '@emotion/react';
import { IllustrationIconWrapper } from '@ui/display/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconManyToManyProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconManyToMany = (
  props: IllustrationIconManyToManyProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconManyToManyRaw
        height={size}
        width={size}
        fill={fill.blue}
        color={color.blue}
      />
    </IllustrationIconWrapper>
  );
};
