import { styled } from '@linaria/react';
import { AppTooltip, type IconComponent, TooltipDelay } from '@ui/display';
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
  tooltipContent?: string;
};

const StyledTabTooltipWrapper = styled.div`
  display: flex;
`;

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
  tooltipContent,
}: TabButtonProps) => {
  const tabElementId = `tab-${id}`;

  return (
    <StyledTabTooltipWrapper key={id} id={tabElementId}>
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
      {tooltipContent && (
        <AppTooltip
          anchorSelect={`#${tabElementId}`}
          content={tooltipContent}
          noArrow
          place="bottom"
          positionStrategy="fixed"
          delay={TooltipDelay.shortDelay}
        />
      )}
    </StyledTabTooltipWrapper>
  );
};
