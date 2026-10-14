import { useEffect, type RefObject } from 'react';

import { type Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type OverflowingTextWithTooltipProps } from '../types/OverflowingTextWithTooltipProps';

type OverflowingTextInitialHoverEffectProps = {
  textRef: RefObject<HTMLElement | null>;
  pointerPosition: NonNullable<
    OverflowingTextWithTooltipProps['initialPointerPosition']
  >;
  tooltipDelay: number;
  tooltipHandle: ReturnType<typeof Tooltip.createHandle>;
  triggerId: string;
};

export const OverflowingTextInitialHoverEffect = ({
  textRef,
  pointerPosition: { clientX, clientY },
  tooltipDelay,
  tooltipHandle,
  triggerId,
}: OverflowingTextInitialHoverEffectProps) => {
  useEffect(() => {
    const textElement = textRef.current;

    if (!isDefined(textElement)) {
      return;
    }

    const ownerDocument = textElement.ownerDocument;
    const ownerWindow = ownerDocument.defaultView;

    if (!isDefined(ownerWindow)) {
      return;
    }

    const timeoutId = ownerWindow.setTimeout(() => {
      const hoveredElement = ownerDocument.elementFromPoint(clientX, clientY);

      if (!isDefined(hoveredElement) || !textElement.contains(hoveredElement)) {
        return;
      }

      tooltipHandle.open(triggerId);
    }, tooltipDelay);

    const cancelInitialHover = () => ownerWindow.clearTimeout(timeoutId);

    ownerDocument.addEventListener('pointermove', cancelInitialHover, true);
    ownerDocument.addEventListener('pointerleave', cancelInitialHover, true);
    ownerDocument.addEventListener('scroll', cancelInitialHover, true);

    return () => {
      cancelInitialHover();
      ownerDocument.removeEventListener(
        'pointermove',
        cancelInitialHover,
        true,
      );
      ownerDocument.removeEventListener(
        'pointerleave',
        cancelInitialHover,
        true,
      );
      ownerDocument.removeEventListener('scroll', cancelInitialHover, true);
    };
  }, [clientX, clientY, textRef, tooltipDelay, tooltipHandle, triggerId]);

  return null;
};
