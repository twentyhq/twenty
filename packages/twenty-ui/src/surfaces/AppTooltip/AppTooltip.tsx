import { Tooltip } from '@base-ui/react/tooltip';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useThemeContainer } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './AppTooltip.module.scss';

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

// Same shapes as react-tooltip's PlacesType and PositionStrategy, kept for
// public API parity with the deprecated AppTooltip
type PlacesType =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

type PositionStrategy = 'absolute' | 'fixed';

// react-tooltip's delayHide that the deprecated AppTooltip hardcoded
const HIDE_DELAY_MS = 20;

// react-tooltip's default anchor offset
const DEFAULT_OFFSET = 10;

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

  const themeContainer = useThemeContainer();

  const [show, setShow] = useState(false);
  const [anchorElements, setAnchorElements] = useState<Element[]>([]);
  const [activeAnchor, setActiveAnchor] = useState<Element | null>(null);

  const showDelayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const hideDelayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  // Mirrors react-tooltip's `rendered` flag: while the tooltip is still
  // mounted (including its fade-out), re-entering an anchor reopens it
  // without waiting for the show delay again
  const isRenderedRef = useRef(false);
  const isHoveringTooltipRef = useRef(false);

  const isControlled = isDefined(isOpen);
  const delayShowMs = getDelayInMis(delay);

  // Track anchors matching the selector, including ones added to the DOM
  // later, like react-tooltip does with its MutationObserver
  useEffect(() => {
    if (!isNonEmptyString(anchorSelect)) {
      setAnchorElements([]);
      return;
    }

    const queryAnchorElements = () => {
      try {
        return Array.from(document.querySelectorAll(anchorSelect));
      } catch {
        return [];
      }
    };

    setAnchorElements(queryAnchorElements());

    const observer = new MutationObserver(() => {
      setAnchorElements((previousAnchorElements) => {
        const newAnchorElements = queryAnchorElements();

        const hasSameAnchors =
          newAnchorElements.length === previousAnchorElements.length &&
          newAnchorElements.every(
            (anchorElement, index) =>
              anchorElement === previousAnchorElements[index],
          );

        return hasSameAnchors ? previousAnchorElements : newAnchorElements;
      });
    });

    // also watch data-tooltip-id like react-tooltip, since anchors are
    // commonly matched with a [data-tooltip-id='...'] selector
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-tooltip-id'],
    });

    return () => observer.disconnect();
  }, [anchorSelect]);

  // Like react-tooltip, fall back to the first matched anchor so that a
  // controlled tooltip (isOpen) can position itself without a hover event
  useEffect(() => {
    if (isDefined(activeAnchor) && anchorElements.includes(activeAnchor)) {
      return;
    }

    setActiveAnchor(anchorElements[0] ?? null);
  }, [anchorElements, activeAnchor]);

  useEffect(() => {
    if (anchorElements.length === 0) {
      return;
    }

    const handleShow = (value: boolean) => {
      if (!isControlled) {
        setShow(value);
      }
    };

    const handleAnchorEnter = (anchorElement: Element) => {
      if (!anchorElement.isConnected) {
        setActiveAnchor(null);
        return;
      }

      if (delayShowMs > 0) {
        clearTimeout(showDelayTimerRef.current);
        if (isRenderedRef.current) {
          // the tooltip is already visible, ignore the show delay
          handleShow(true);
        } else {
          showDelayTimerRef.current = setTimeout(() => {
            handleShow(true);
          }, delayShowMs);
        }
      } else {
        handleShow(true);
      }

      setActiveAnchor(anchorElement);
      clearTimeout(hideDelayTimerRef.current);
    };

    const handleAnchorLeave = () => {
      clearTimeout(hideDelayTimerRef.current);
      hideDelayTimerRef.current = setTimeout(() => {
        if (isHoveringTooltipRef.current) {
          return;
        }
        handleShow(false);
      }, HIDE_DELAY_MS);
      clearTimeout(showDelayTimerRef.current);
    };

    const removeListeners = anchorElements.map((anchorElement) => {
      const handleEnter = () => handleAnchorEnter(anchorElement);
      const handleLeave = () => handleAnchorLeave();

      // mouseover/mouseout instead of mouseenter/mouseleave to replicate
      // react-tooltip's default open and close events
      anchorElement.addEventListener('mouseover', handleEnter);
      anchorElement.addEventListener('mouseout', handleLeave);
      anchorElement.addEventListener('focus', handleEnter);
      anchorElement.addEventListener('blur', handleLeave);

      return () => {
        anchorElement.removeEventListener('mouseover', handleEnter);
        anchorElement.removeEventListener('mouseout', handleLeave);
        anchorElement.removeEventListener('focus', handleEnter);
        anchorElement.removeEventListener('blur', handleLeave);
      };
    });

    return () => removeListeners.forEach((removeListener) => removeListener());
  }, [anchorElements, isControlled, delayShowMs]);

  useEffect(() => {
    return () => {
      clearTimeout(showDelayTimerRef.current);
      clearTimeout(hideDelayTimerRef.current);
    };
  }, []);

  const handleTooltipMouseEnter = () => {
    isHoveringTooltipRef.current = true;
  };

  const handleTooltipMouseLeave = () => {
    isHoveringTooltipRef.current = false;
    clearTimeout(hideDelayTimerRef.current);
    hideDelayTimerRef.current = setTimeout(() => {
      if (isHoveringTooltipRef.current) {
        return;
      }
      if (!isControlled) {
        setShow(false);
      }
    }, HIDE_DELAY_MS);
    clearTimeout(showDelayTimerRef.current);
  };

  // react-tooltip's content priority: content prop wins over children
  const renderedContent = isNonEmptyString(content) ? content : children;

  const isTooltipOpen =
    !hidden &&
    (isOpen ?? show) &&
    Boolean(renderedContent) &&
    isDefined(activeAnchor);

  useEffect(() => {
    if (isTooltipOpen) {
      isRenderedRef.current = true;
    }
  }, [isTooltipOpen]);

  const [parsedSide, parsedAlign] = (place ?? 'top').split('-');
  const side = parsedSide as 'top' | 'right' | 'bottom' | 'left';
  const align = (parsedAlign ?? 'center') as 'start' | 'center' | 'end';

  return (
    <Tooltip.Root
      open={isTooltipOpen}
      onOpenChangeComplete={(openValue) => {
        if (!openValue) {
          isRenderedRef.current = false;
        }
      }}
    >
      <Tooltip.Portal container={themeContainer ?? undefined}>
        <Tooltip.Positioner
          anchor={activeAnchor}
          side={side}
          align={align}
          sideOffset={offset ?? DEFAULT_OFFSET}
          positionMethod={positionStrategy}
          className={styles.positioner}
          style={{ maxWidth: width ?? '40%' }}
        >
          <Tooltip.Popup
            className={clsx(
              styles.tooltip,
              clickable && styles.clickable,
              className,
            )}
            onMouseEnter={clickable ? handleTooltipMouseEnter : undefined}
            onMouseLeave={clickable ? handleTooltipMouseLeave : undefined}
          >
            {renderedContent}
            {!noArrow && <Tooltip.Arrow className={styles.arrow} />}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
