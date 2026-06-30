import IllustrationIconOneToManyRaw from '@assets/icons/illustration-one-to-many.svg?react';
import { IllustrationIconWrapper } from '@ui/icon/components/IllustrationIconWrapper';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IllustrationIconOneToManyProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconOneToMany = (
  props: IllustrationIconOneToManyProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  return (
    <IllustrationIconWrapper>
      <IllustrationIconOneToManyRaw
        height={size}
        width={size}
        fill={theme.accent.accent3}
        color={theme.accent.accent8}
      />
    </IllustrationIconWrapper>
  );
};
