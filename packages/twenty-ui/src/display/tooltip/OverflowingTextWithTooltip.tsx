import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { THEME_COMMON } from '@ui/theme';

import { isDefined } from '@ui/utilities';
import { AppTooltip, TooltipDelay } from './AppTooltip';

const spacing4 = THEME_COMMON.spacing(4);

const StyledOverflowingMultilineText = styled.div<{
  cursorPointer: boolean;
  size: 'large' | 'small';
  displayedMaxRows: number;
}>`
  cursor: ${({ cursorPointer }) => (cursorPointer ? 'pointer' : 'inherit')};
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

  & :hover {
    text-overflow: ${({ cursorPointer }) =>
      cursorPointer ? 'clip' : 'ellipsis'};
    white-space: ${({ cursorPointer }) =>
      cursorPointer ? 'normal' : 'nowrap'};
  }
`;

const StyledOverflowingText = styled.div<{
  cursorPointer: boolean;
  size: 'large' | 'small';
}>`
  cursor: ${({ cursorPointer }) => (cursorPointer ? 'pointer' : 'inherit')};
  font-family: inherit;
  font-size: inherit;

  font-weight: inherit;
  max-width: 100%;
  overflow: hidden;
  text-decoration: inherit;

  text-overflow: ellipsis;
  height: ${({ size }) => (size === 'large' ? spacing4 : 'auto')};

  white-space: nowrap;

  & :hover {
    text-overflow: ${({ cursorPointer }) =>
      cursorPointer ? 'clip' : 'ellipsis'};
    white-space: ${({ cursorPointer }) =>
      cursorPointer ? 'normal' : 'nowrap'};
  }
`;

const Styledpre = styled.pre`
  font-family: inherit;
  white-space: pre-wrap;
`;

export const OverflowingTextWithTooltip = ({
  size = 'small',
  text,
  isTooltipMultiline,
  displayedMaxRows,
  hideTooltip,
}: {
  size?: 'large' | 'small';
  text: string | null | undefined;
  isTooltipMultiline?: boolean;
  displayedMaxRows?: number;
  hideTooltip?: boolean;
}) => {
  const textElementId = `title-id-${+new Date()}`;

  const textRef = useRef<HTMLDivElement>(null);

  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);

  const handleMouseEnter = () => {
    const isOverflowing =
      (text?.length ?? 0) > 0 && textRef.current
        ? textRef.current?.scrollHeight > textRef.current?.clientHeight ||
          textRef.current.scrollWidth > textRef.current.clientWidth
        : false;

    setIsTitleOverflowing(isOverflowing);
  };

  const handleMouseLeave = () => {
    setIsTitleOverflowing(false);
  };

  const handleTooltipClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };
  return (
    <>
      {isDefined(displayedMaxRows) && (
        <StyledOverflowingMultilineText
          data-testid="tooltip"
          cursorPointer={isTitleOverflowing}
          size={size}
          displayedMaxRows={displayedMaxRows}
          ref={textRef}
          id={textElementId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {text}
        </StyledOverflowingMultilineText>
      )}
      {!isDefined(displayedMaxRows) && (
        <StyledOverflowingText
          data-testid="tooltip"
          cursorPointer={isTitleOverflowing}
          size={size}
          ref={textRef}
          id={textElementId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {text}
        </StyledOverflowingText>
      )}
      {createPortal(
        <div onClick={handleTooltipClick}>
          <AppTooltip
            anchorSelect={`#${textElementId}`}
            offset={5}
            hidden={!isTitleOverflowing || hideTooltip}
            noArrow
            place="bottom"
            positionStrategy="absolute"
            delay={TooltipDelay.mediumDelay}
          >
            {isTooltipMultiline ? (
              <Styledpre>{text}</Styledpre>
            ) : (
              `${text || ''}`
            )}
          </AppTooltip>
        </div>,
        document.body,
      )}
    </>
  );
};
