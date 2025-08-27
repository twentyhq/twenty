import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display/icon/types/IconComponent';

import { NavigationBarItem } from './NavigationBarItem';

const StyledContainer = styled.div`
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  padding: var(--spacing-3);
  z-index: 1001;
`;

type NavigationBarProps = {
  activeItemName: string;
  items: { name: string; Icon: IconComponent; onClick: () => void }[];
};

export const NavigationBar = ({
  activeItemName,
  items,
}: NavigationBarProps) => (
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
