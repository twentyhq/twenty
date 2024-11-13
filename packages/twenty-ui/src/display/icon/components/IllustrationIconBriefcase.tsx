import { useTheme } from '@emotion/react';

import IllustrationIconBriefcaseRaw from '@ui/display/icon/assets/illustration-briefcase.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IllustrationIconBriefcaseProps = Pick<IconComponentProps, 'size'>;

export const IllustrationIconBriefcase = (
  props: IllustrationIconBriefcaseProps,
) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;
  const { color, fill } = theme.IllustrationIcon;
  return (
    <IllustrationIconBriefcaseRaw
      width={size}
      height={size}
      fill={fill.grey}
      color={color.grey}
    />
  );
};
