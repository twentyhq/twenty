import { useTheme } from '@emotion/react';

import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';

const StyledIconContainer = styled.div`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export type MenuItemIconProps = {
  Icon: IconComponent | null | undefined;
  withContainer?: boolean;
};

export const MenuItemIcon = ({
  Icon,
  withContainer = false,
}: MenuItemIconProps) => {
  const theme = useTheme();

  if (!Icon) {
    return null;
  }

  const iconElement = (
    <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
  );

  if (withContainer) {
    return <StyledIconContainer>{iconElement}</StyledIconContainer>;
  }

  return iconElement;
};
