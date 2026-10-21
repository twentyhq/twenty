import IconModelClaudeRaw from '@assets/icons/claude.svg?react';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';
import { useTheme } from '@ui/theme';

type IconModelClaudeProps = Pick<IconComponentProps, 'size'>;

export const IconModelClaude = (props: IconModelClaudeProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconModelClaudeRaw data-twenty-icon="" height={size} width={size} />;
};
