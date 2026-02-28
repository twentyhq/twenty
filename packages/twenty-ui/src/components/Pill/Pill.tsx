import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { theme } from '@ui/theme';

type PillProps = {
  className?: string;
  label?: string;
  Icon?: IconComponent;
};

const StyledPill = styled.span`
  align-items: center;
  background: ${theme.background.transparent.light};
  border-radius: ${theme.border.radius.pill};
  color: ${theme.font.color.light};
  display: inline-flex;
  font-size: ${theme.font.size.xs};
  font-style: normal;
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing[1]};
  height: ${theme.spacing[4]};
  justify-content: flex-end;
  line-height: ${theme.text.lineHeight.lg};
  padding: 0 ${theme.spacing[2]};
`;

export const Pill = ({ className, label, Icon }: PillProps) => {
  return (
    <StyledPill className={className}>
      {Icon && <Icon size={12} />}
      {label}
    </StyledPill>
  );
};
