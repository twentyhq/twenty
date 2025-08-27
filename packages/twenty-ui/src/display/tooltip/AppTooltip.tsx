import { styled } from '@linaria/react';
import { type PlacesType, type PositionStrategy, Tooltip } from 'react-tooltip';

import { COLOR } from '@ui/theme';
import { RGBA } from '@ui/theme/constants/Rgba';

export enum TooltipPosition {
  Top = 'top',
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
}

export enum TooltipDelay {
  noDelay = '0ms',
  shortDelay = '300ms',
  mediumDelay = '500ms',
  longDelay = '1000ms',
}

const StyledAppTooltip = styled(Tooltip)<{ width?: string }>`
  backdrop-filter: var(--blur-strong);
  background-color: ${RGBA(COLOR.gray80, 0.8)};
  border-radius: var(--border-radius-sm);

  box-shadow: var(--box-shadow-light);
  color: var(--color-gray-0);

  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);

  max-width: ${({ width }) => width || '40%'};
  overflow: visible;

  padding: var(--spacing-2);

  word-break: break-word;

  z-index: var(--last-layer-z-index);
`;

export type AppTooltipProps = {
  className?: string;
  anchorSelect?: string;
  content?: string;
  children?: React.ReactNode;
  offset?: number;
  noArrow?: boolean;
  hidden?: boolean;
  place?: PlacesType;
  delay?: TooltipDelay;
  positionStrategy?: PositionStrategy;
  clickable?: boolean;
  width?: string;
  isOpen?: boolean;
};

export const AppTooltip = ({
  anchorSelect,
  className,
  content,
  hidden = false,
  noArrow,
  offset,
  delay = TooltipDelay.mediumDelay,
  place,
  positionStrategy,
  children,
  clickable,
  width,
  isOpen,
}: AppTooltipProps) => {
  const getDelayInMis = (delay: TooltipDelay) => {
    switch (delay) {
      case TooltipDelay.noDelay:
        return 0;
      case TooltipDelay.shortDelay:
        return 300;
      case TooltipDelay.mediumDelay:
        return 500;
      case TooltipDelay.longDelay:
        return 1000;
    }
  };

  return (
    <StyledAppTooltip
      {...{
        anchorSelect,
        className,
        content,
        delayShow: getDelayInMis(delay),
        delayHide: 20,
        hidden,
        noArrow,
        offset,
        place,
        positionStrategy,
        children,
        clickable,
        width,
        isOpen,
      }}
    />
  );
};
