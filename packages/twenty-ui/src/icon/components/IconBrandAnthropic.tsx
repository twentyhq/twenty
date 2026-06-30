import IconAnthropicRaw from '@assets/icons/anthropic.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconBrandAnthropicProps = Pick<IconComponentProps, 'size'>;

export const IconBrandAnthropic = (props: IconBrandAnthropicProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconAnthropicRaw height={size} width={size} />;
};
