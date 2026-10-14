import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import {
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
} from 'react';

import { Tooltip } from '@ui/primitives/surfaces/Tooltip/Tooltip';
import { TooltipBody } from '@ui/primitives/surfaces/Tooltip/internal/TooltipBody';
import { type TextProps } from '@ui/primitives/typography/Text/types/TextProps';
import { OverflowingTextInitialHoverEffect } from './OverflowingTextInitialHoverEffect';
import { type OverflowingTextWithTooltipProps } from '../types/OverflowingTextWithTooltipProps';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../OverflowingTextWithTooltip.module.scss';

type OverflowingTextTooltipProps = Pick<
  OverflowingTextWithTooltipProps,
  | 'isTooltipMultiline'
  | 'tooltipDelay'
  | 'tooltipPlace'
  | 'alwaysShowTooltip'
  | 'initialPointerPosition'
> & {
  children: ReactElement<TextProps>;
  tooltipText: string | null;
};

export const OverflowingTextTooltip = ({
  children,
  tooltipText,
  isTooltipMultiline,
  tooltipDelay = 500,
  tooltipPlace = 'bottom',
  alwaysShowTooltip = false,
  initialPointerPosition,
}: OverflowingTextTooltipProps) => {
  const textRef = useRef<HTMLElement>(null);
  const triggerRef = useMergedRefs(textRef, null);
  const generatedTriggerId = useId();
  const triggerId = children.props.id ?? generatedTriggerId;
  const [tooltipHandle] = useState(() => Tooltip.createHandle());

  const [isTitleOverflowing, setIsTitleOverflowing] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const updateOverflowState = () => {
    const textElement = textRef.current;
    const isOverflowing =
      isDefined(textElement) &&
      (textElement.scrollHeight > textElement.clientHeight ||
        textElement.scrollWidth > textElement.clientWidth);

    setIsTitleOverflowing(isOverflowing);

    return isOverflowing;
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsTooltipOpen(false);

      return;
    }

    const isOverflowing = updateOverflowState();

    setIsTooltipOpen(isOverflowing || alwaysShowTooltip);
  };

  const handleTooltipClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
  };

  return (
    <Tooltip.Root
      handle={tooltipHandle}
      open={isTooltipOpen && isDefined(tooltipText)}
      onOpenChange={(...openChangeArguments) => {
        const [open, eventDetails] = openChangeArguments;
        const shouldKeepTooltipOpen =
          !open &&
          eventDetails.reason === 'trigger-hover' &&
          textRef.current?.contains(document.activeElement);

        if (shouldKeepTooltipOpen) {
          eventDetails.cancel();

          return;
        }

        handleOpenChange(open);
      }}
      disabled={
        !isDefined(tooltipText) ||
        (!isDefined(initialPointerPosition) &&
          !isTitleOverflowing &&
          !alwaysShowTooltip)
      }
    >
      <Tooltip.Trigger
        id={triggerId}
        handle={tooltipHandle}
        delay={tooltipDelay}
        closeOnClick={false}
        render={children}
        ref={triggerRef}
        data-content-overflowing={isTitleOverflowing ? '' : undefined}
        onPointerEnter={updateOverflowState}
        onFocus={() => handleOpenChange(true)}
      />
      {isDefined(initialPointerPosition) && (
        <OverflowingTextInitialHoverEffect
          textRef={textRef}
          pointerPosition={initialPointerPosition}
          tooltipDelay={tooltipDelay}
          tooltipHandle={tooltipHandle}
          triggerId={triggerId}
        />
      )}
      <Tooltip.Portal>
        <Tooltip.Positioner
          sideOffset={5}
          side={tooltipPlace}
          positionMethod="absolute"
          style={{ maxWidth: '300px' }}
        >
          <Tooltip.Popup
            className={isTooltipMultiline ? styles.multilineTooltip : undefined}
            onClick={handleTooltipClick}
          >
            <TooltipBody>{tooltipText}</TooltipBody>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
