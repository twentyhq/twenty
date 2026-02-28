import { styled } from '@linaria/react';

import { type IconComponent } from '@ui/display/icon/types/IconComponent';
import { theme } from '@ui/theme';

import { NavigationBarItem } from './NavigationBarItem';

const StyledContainer = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  justify-content: center;
  padding: ${theme.spacing[3]};
  z-index: 1001;
`;

type NavigationBarProps = {
  activeItemName: string;
  items: { name: string; Icon: IconComponent; onClick: () => void }[];
};

export const NavigationBar = ({
  activeItemName,
  items,
}: NavigationBarProps) => {
  return (
    <StyledContainer>
      {items.map(({ Icon, name, onClick }) => (
        <NavigationBarItem
          key={name}
          Icon={Icon}
          isActive={activeItemName === name}
          onClick={onClick}
        />
      ))}
    </StyledContainer>
  );
};
