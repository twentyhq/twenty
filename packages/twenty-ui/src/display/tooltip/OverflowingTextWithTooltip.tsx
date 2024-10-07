import { styled } from '@linaria/react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { THEME_COMMON } from '@ui/theme';

import { AppTooltip, TooltipDelay } from './AppTooltip';

const spacing4 = THEME_COMMON.spacing(4);

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
  white-space: nowrap;

  height: ${({ size }) => (size === 'large' ? spacing4 : 'auto')};

  & :hover {
    text-overflow: ${({ cursorPointer }) =>
      cursorPointer ? 'clip' : 'ellipsis'};
    white-space: ${({ cursorPointer }) =>
      cursorPointer ? 'normal' : 'nowrap'};
  }
`;

export const OverflowingTextWithTooltip = ({
  size = 'small',
  text,
  mutliline,
}: {
  size?: 'large' | 'small';
  text: string | null | undefined;
  mutliline?: boolean;
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
      {isTitleOverflowing &&
        createPortal(
          <div onClick={handleTooltipClick}>
            <AppTooltip
              anchorSelect={`#${textElementId}`}
              content={mutliline ? undefined : (text ?? '')}
              offset={5}
              isOpen
              noArrow
              place="bottom"
              positionStrategy="absolute"
              delay={TooltipDelay.mediumDelay}
            >
              {mutliline ? <pre>{text}</pre> : ''}
            </AppTooltip>
          </div>,
          document.body,
        )}
    </>
  );
};
