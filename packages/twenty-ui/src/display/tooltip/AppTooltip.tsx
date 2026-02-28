import { styled } from '@linaria/react';
import { type PlacesType, type PositionStrategy, Tooltip } from 'react-tooltip';
import { theme } from '@ui/theme';

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
  backdrop-filter: ${theme.blur.strong};
  background-color: ${theme.color.transparent.gray11};
  border-radius: ${theme.border.radius.sm};

  box-shadow: ${theme.boxShadow.light};
  color: ${theme.grayScale.gray1};

  font-size: ${theme.font.size.sm};
  font-weight: ${theme.font.weight.regular};

  max-width: ${({ width }) => width || '40%'};
  overflow: visible;

  padding: ${theme.spacing[2]};

  word-break: break-word;

  z-index: ${theme.lastLayerZIndex};
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
