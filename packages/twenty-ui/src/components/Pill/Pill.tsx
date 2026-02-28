import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { themeVar } from '@ui/theme';

type PillProps = {
  className?: string;
  label?: string;
  Icon?: IconComponent;
};

const StyledPill = styled.span`
  align-items: center;
  background: ${themeVar.background.transparent.light};
  border-radius: ${themeVar.border.radius.pill};
  color: ${themeVar.font.color.light};
  display: inline-flex;
  font-size: ${themeVar.font.size.xs};
  font-style: normal;
  font-weight: ${themeVar.font.weight.medium};
  gap: ${themeVar.spacing[1]};
  height: ${themeVar.spacing[4]};
  justify-content: flex-end;
  line-height: ${themeVar.text.lineHeight.lg};
  padding: 0 ${themeVar.spacing[2]};
`;

export const Pill = ({ className, label, Icon }: PillProps) => {
  return (
    <StyledPill className={className}>
      {Icon && <Icon size={12} />}
      {label}
    </StyledPill>
  );
};
