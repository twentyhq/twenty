import { type IconComponent } from '@ui/icon';
import { AppTooltip, TooltipDelay } from '@ui/surfaces';
import {
  StyledTabButton,
  StyledTabContainer,
} from '@ui/input/TabButton/parts/StyledTabBase';
import {
  TabContent,
  type TabContentProps,
} from '@ui/input/TabButton/parts/TabContent';
import { type ReactElement } from 'react';

import styles from './TabButton.module.scss';

export { StyledTabContainer, TabContent };
export type { TabContentProps };

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
    <div key={id} id={tabElementId} className={styles.tabTooltipWrapper}>
      <StyledTabButton
        data-testid={disableTestId ? undefined : `tab-${id}`}
        active={active}
        disabled={disabled}
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
    </div>
  );
};
