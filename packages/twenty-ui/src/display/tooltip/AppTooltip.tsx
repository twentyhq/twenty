import { styled } from '@linaria/react';
import { type PlacesType, type PositionStrategy, Tooltip } from 'react-tooltip';
import { themeCssVariables } from '@ui/theme';

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
  backdrop-filter: ${themeCssVariables.blur.strong};
  background-color: ${themeCssVariables.color.transparent.gray11};
  border-radius: ${themeCssVariables.border.radius.sm};

  box-shadow: ${themeCssVariables.boxShadow.light};
  color: ${themeCssVariables.grayScale.gray1};

  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};

  max-width: ${({ width }) => width || '40%'};
  overflow: visible;

  padding: ${themeCssVariables.spacing[2]};

  word-break: break-word;

  z-index: ${themeCssVariables.lastLayerZIndex};
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
