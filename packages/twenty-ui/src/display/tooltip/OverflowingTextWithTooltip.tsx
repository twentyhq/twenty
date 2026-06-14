import { type CSSProperties, type ReactNode, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { LinkifiedText } from '@ui/display/components/LinkifiedText';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { AppTooltip, TooltipDelay } from './AppTooltip';

import styles from './OverflowingTextWithTooltip.module.scss';

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
        <div
          data-testid="tooltip"
          data-content-overflowing={isTitleOverflowing ? '' : undefined}
          className={clsx(
            styles.overflowingMultilineText,
            size === 'large' && styles.large,
          )}
          style={
            {
              '--displayed-max-rows': displayedMaxRows
                ? displayedMaxRows.toString()
                : '1',
            } as CSSProperties
          }
          ref={textRef}
          id={textElementId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isNonEmptyString(text) ? <LinkifiedText text={text} /> : text}
        </div>
      ) : (
        <div
          data-testid="tooltip"
          data-content-overflowing={isTitleOverflowing ? '' : undefined}
          className={clsx(
            styles.overflowingText,
            size === 'large' && styles.large,
          )}
          ref={textRef}
          id={textElementId}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {isNonEmptyString(text) ? <LinkifiedText text={text} /> : text}
        </div>
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
                <pre className={styles.pre}>{tooltipText}</pre>
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
