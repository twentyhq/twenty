import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { themeCssVariables } from '@ui/theme-constants';

const StyledIconContainerBase = styled.div`
  align-items: flex-start;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledIconContainerWithBackground = styled.div`
  align-items: flex-start;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[1]};
`;

export const StyledIconContainer = ({
  children,
  className,
  hasBackground = true,
}: {
  children?: ReactNode;
  className?: string;
  hasBackground?: boolean;
}) => {
  const Component = hasBackground
    ? StyledIconContainerWithBackground
    : StyledIconContainerBase;

  return <Component className={className}>{children}</Component>;
};

export { StyledIconContainer as MenuItemIconBoxContainer };
