import { Tooltip } from '@base-ui/react/tooltip';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import { useTheme, useThemeContainer } from '@ui/theme-constants';
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
  offset?: number;
  noArrow?: boolean;
  hidden?: boolean;
  place?: PlacesType;
  delay?: TooltipDelay;
  positionStrategy?: PositionStrategy;
  interactive?: boolean;
  maxWidth?: string;
  isOpen?: boolean;
  title?: string;
  Icon?: IconComponent;
  description?: string;
  children?: React.ReactNode;
};

export const AppTooltip = ({
  anchorSelect,
  className,
  title,
  Icon,
  description,
  hidden = false,
  noArrow = true,
  offset,
  delay = TooltipDelay.mediumDelay,
  place,
  positionStrategy,
  children,
  interactive,
  maxWidth = '300px',
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
  const theme = useTheme();

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

    setShow(false);
    setActiveAnchor(anchorElements[0] ?? null);
  }, [anchorElements, activeAnchor]);

  useEffect(() => {
    if (hidden || anchorElements.length === 0) {
      setShow(false);
      isHoveringTooltipRef.current = false;
      return;
    }

    let hoveredAnchor: Element | null = null;
    let focusedAnchor: Element | null = null;

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

    // Always defer the hide: a shared tooltip moved between anchors would
    // otherwise unmount and remount, losing the popup node mid-swap.
    const handleAnchorLeave = () => {
      clearTimeout(showDelayTimerRef.current);
      clearTimeout(hideDelayTimerRef.current);

      hideDelayTimerRef.current = setTimeout(() => {
        if (isHoveringTooltipRef.current) {
          return;
        }
        handleShow(false);
      }, HIDE_DELAY_MS);
    };

    // Dragging or replacing a row can prevent its mouseleave event. Only
    // watched while an anchor is hovered, so idle tooltips cost nothing.
    const handlePointerMove = (event: PointerEvent) => {
      if (
        isDefined(hoveredAnchor) &&
        event.target instanceof Node &&
        !hoveredAnchor.contains(event.target)
      ) {
        stopWatchingPointer();
        if (!isDefined(focusedAnchor)) {
          handleAnchorLeave();
        }
      }
    };

    const stopWatchingPointer = () => {
      hoveredAnchor = null;
      document.removeEventListener('pointermove', handlePointerMove);
    };

    const removeListeners = anchorElements.map((anchorElement) => {
      const handleEnter = () => {
        hoveredAnchor = anchorElement;
        document.addEventListener('pointermove', handlePointerMove);
        handleAnchorEnter(anchorElement);
      };
      // Keyboard focus keeps the tooltip up on its own, so only a blur closes
      // one the anchor itself was focused into.
      const handlePointerLeave = () => {
        stopWatchingPointer();
        if (isDefined(focusedAnchor)) {
          return;
        }
        handleAnchorLeave();
      };
      const handleFocus = () => {
        focusedAnchor = anchorElement;
        handleAnchorEnter(anchorElement);
      };
      const handleBlur = () => {
        focusedAnchor = null;
        stopWatchingPointer();
        handleAnchorLeave();
      };

      // Deliberately not react-tooltip's mouseover/mouseout parity: those fire
      // per descendant, so child-to-child movement restarted the show timer.
      anchorElement.addEventListener('mouseenter', handleEnter);
      anchorElement.addEventListener('mouseleave', handlePointerLeave);
      anchorElement.addEventListener('focus', handleFocus);
      anchorElement.addEventListener('blur', handleBlur);

      return () => {
        anchorElement.removeEventListener('mouseenter', handleEnter);
        anchorElement.removeEventListener('mouseleave', handlePointerLeave);
        anchorElement.removeEventListener('focus', handleFocus);
        anchorElement.removeEventListener('blur', handleBlur);
      };
    });

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      removeListeners.forEach((removeListener) => removeListener());
      clearTimeout(showDelayTimerRef.current);
      clearTimeout(hideDelayTimerRef.current);
    };
  }, [anchorElements, isControlled, delayShowMs, interactive, hidden]);

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
    if (activeAnchor?.contains(activeAnchor.ownerDocument.activeElement)) {
      return;
    }
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

  const hasTitle = isNonEmptyString(title);
  const hasDescription = isNonEmptyString(description);
  const renderedContent =
    hasTitle || hasDescription ? (
      <>
        <div className={styles.textContent}>
          {hasTitle && (
            <div className={styles.title}>
              {isDefined(Icon) && (
                <Icon
                  className={styles.icon}
                  size={theme.icon.size.sm}
                  aria-hidden
                />
              )}
              <span>{title}</span>
            </div>
          )}
          {hasDescription && (
            <div className={styles.description}>{description}</div>
          )}
        </div>
        {children}
      </>
    ) : (
      children
    );

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
          style={{ maxWidth }}
        >
          <Tooltip.Popup
            role="tooltip"
            className={clsx(
              styles.tooltip,
              interactive && styles.interactive,
              className,
            )}
            onMouseEnter={interactive ? handleTooltipMouseEnter : undefined}
            onMouseLeave={interactive ? handleTooltipMouseLeave : undefined}
          >
            {renderedContent}
            {!noArrow && <Tooltip.Arrow className={styles.arrow} />}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
