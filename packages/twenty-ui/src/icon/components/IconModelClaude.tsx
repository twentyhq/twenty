import IconModelClaudeRaw from '@assets/icons/claude.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme-constants';

type IconModelClaudeProps = Pick<IconComponentProps, 'size'>;

export const IconModelClaude = (props: IconModelClaudeProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconModelClaudeRaw height={size} width={size} />;
};
