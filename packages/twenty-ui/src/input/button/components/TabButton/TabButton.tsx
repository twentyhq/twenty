import { type IconComponent } from '@ui/display';
import { StyledTabButton } from '@ui/input/button/components/TabButton/internals/components/StyledTabBase';
import { TabContent } from '@ui/input/button/components/TabButton/internals/components/TabContent';
import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';

type TabButtonProps = {
  id: string;
  active?: boolean;
  disabled?: boolean;
  to?: string;
  LeftIcon?: IconComponent;
  className?: string;
  title?: string;
  onClick?: () => void;
  logo?: string;
  RightIcon?: IconComponent;
  pill?: string | ReactElement;
  contentSize?: 'sm' | 'md';
  disableTestId?: boolean;
};

export const TabButton = ({
  id,
  active,
  disabled,
  to,
  LeftIcon,
  className,
  title,
  onClick,
  logo,
  RightIcon,
  pill,
  contentSize = 'sm',
  disableTestId = false,
}: TabButtonProps) => {
  return (
    <StyledTabButton
      data-testid={disableTestId ? undefined : `tab-${id}`}
      active={active}
      disabled={disabled}
      as={to ? Link : 'button'}
      to={to}
      className={className}
      onClick={onClick}
    >
      <TabContent
        id={id}
        active={active}
        disabled={disabled}
        LeftIcon={LeftIcon}
        title={title}
        logo={logo}
        RightIcon={RightIcon}
        pill={pill}
        contentSize={contentSize}
      />
    </StyledTabButton>
  );
};
