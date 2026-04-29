import { styled } from '@linaria/react';
import { type ReactNode, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { isNonEmptyString } from '@sniptt/guards';
import { LinkifiedText } from '@ui/display/components/LinkifiedText';
import { themeCssVariables } from '@ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';
import { AppTooltip, TooltipDelay } from './AppTooltip';

const spacing4 = themeCssVariables.spacing[4];

const StyledOverflowingMultilineText = styled.div<{
  isContentOverflowing: boolean;
  size: 'large' | 'small';
  displayedMaxRows: number;
}>`
  cursor: ${({ isContentOverflowing }) =>
    isContentOverflowing ? 'pointer' : 'inherit'};
  font-family: inherit;
  font-size: inherit;

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: inherit;

  text-overflow: ellipsis;
  height: ${({ size }) => (size === 'large' ? spacing4 : 'auto')};

  -webkit-line-clamp: ${({ displayedMaxRows }) =>
    displayedMaxRows ? displayedMaxRows.toString() : '1'};
  display: -webkit-box;
  -webkit-box-orient: vertical;
  white-space: pre-wrap;
  overflow-wrap: break-word;
`;

const StyledOverflowingText = styled.div<{
  isContentOverflowing: boolean;
  size: 'large' | 'small';
}>`
  cursor: ${({ isContentOverflowing }) =>
    isContentOverflowing ? 'pointer' : 'inherit'};
  font-family: inherit;
  font-size: inherit;

  font-weight: inherit;
  max-width: 100%;
  text-decoration: inherit;

  text-overflow: ellipsis;
  overflow: hidden;
  height: ${({ size }) => (size === 'large' ? spacing4 : 'auto')};

  white-space: nowrap;
`;

const StyledPre = styled.pre`
  font-family: inherit;
  white-space: pre-wrap;
`;

type OverflowingTextWithTooltipProps = {
  size?: 'large' | 'small';
  isTooltipMultiline?: boolean;
  displayedMaxRows?: number;
  tooltipDelay?: TooltipDelay;
  alwaysShowTooltip?: boolean;
} & (
  | {
      text: string | null | undefined;
      tooltipContent?: string;
    }
  | {
      text: Exclude<ReactNode, string | null | undefined>;
      tooltipContent: string;
    }
);

export const OverflowingTextWithTooltip = ({
  size = 'small',
  text,
  isTooltipMultiline,
  displayedMaxRows,
  tooltipContent,
  tooltipDelay = TooltipDelay.mediumDelay,
  alwaysShowTooltip = false,
}: OverflowingTextWithTooltipProps) => {
  const textElementId = `title-id-${+new Date()}`;

  const textRef = useRef<HTMLDivElement>(null);

  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
  const [shouldRenderTooltip, setShouldRenderTooltip] = useState(false);

  const handleMouseEnter = () => {
    const isOverflowing = textRef.current
      ? textRef.current?.scrollHeight > textRef.current?.clientHeight ||
        textRef.current.scrollWidth > textRef.current.clientWidth
      : false;

    setIsTitleOverflowing(isOverflowing);
    setShouldRenderTooltip(true);
  };

  const handleMouseLeave = () => {
    setIsTitleOverflowing(false);
    setShouldRenderTooltip(false);
  };

  const handleTooltipClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const tooltipText = isNonEmptyString(tooltipContent)
    ? tooltipContent
    : isNonEmptyString(text)
      ? text
      : null;

  return (
    <>
      {isDefined(displayedMaxRows) ? (
        <StyledOverflowingMultilineText
          data-testid="tooltip"
          isContentOverflowing={isTitleOverflowing}
          size={size}
          displayedMaxRows={displayedMaxRows}
          ref={textRef}
          id={textElementId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isNonEmptyString(text) ? <LinkifiedText text={text} /> : text}
        </StyledOverflowingMultilineText>
      ) : (
        <StyledOverflowingText
          data-testid="tooltip"
          isContentOverflowing={isTitleOverflowing}
          size={size}
          ref={textRef}
          id={textElementId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isNonEmptyString(text) ? <LinkifiedText text={text} /> : text}
        </StyledOverflowingText>
      )}

      {shouldRenderTooltip &&
        (isTitleOverflowing || alwaysShowTooltip) &&
        isDefined(tooltipText) &&
        createPortal(
          <div onClick={handleTooltipClick}>
            <AppTooltip
              anchorSelect={`#${textElementId}`}
              offset={5}
              noArrow
              place="bottom"
              positionStrategy="absolute"
              delay={tooltipDelay}
              isOpen={true}
            >
              {isTooltipMultiline ? (
                <StyledPre>{tooltipText}</StyledPre>
              ) : (
                tooltipText
              )}
            </AppTooltip>
          </div>,
          document.body,
        )}
    </>
  );
};
