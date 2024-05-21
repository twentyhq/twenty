import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { v4 as uuidV4 } from 'uuid';

import { AppTooltip } from './AppTooltip';

import styles from './OverflowingTextWithTooltip.module.css';

export const OverflowingTextWithTooltip = ({
  text,
  mutliline,
}: {
  text: string | null | undefined;
  mutliline?: boolean;
}) => {
  const textElementId = `title-id-${uuidV4()}`;

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
      <div
        data-testid="tooltip"
        className={clsx({
          [styles.overflowingText]: true,
          [styles.cursorPointer]: isTitleOverflowing,
        })}
        ref={textRef}
        id={textElementId}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {text}
      </div>
      {isTitleOverflowing &&
        createPortal(
          <div onClick={handleTooltipClick}>
            <AppTooltip
              anchorSelect={`#${textElementId}`}
              content={mutliline ? undefined : text ?? ''}
              delayHide={0}
              offset={5}
              noArrow
              place="bottom"
              positionStrategy="absolute"
            >
              {mutliline ? <pre>{text}</pre> : ''}
            </AppTooltip>
          </div>,
          document.body,
        )}
    </>
  );
};
