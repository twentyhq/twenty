import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { themeCssVariables } from '@ui/theme';

type PillProps = {
  className?: string;
  label?: string;
  Icon?: IconComponent;
};

const StyledPill = styled.span`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.light};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-style: normal;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[4]};
  justify-content: flex-end;
  line-height: ${themeCssVariables.text.lineHeight.lg};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const Pill = ({ className, label, Icon }: PillProps) => {
  return (
    <StyledPill className={className}>
      {Icon && <Icon size={12} />}
      {label}
    </StyledPill>
  );
};
