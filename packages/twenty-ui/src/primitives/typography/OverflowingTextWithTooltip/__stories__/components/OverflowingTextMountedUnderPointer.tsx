import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { OverflowingTextWithTooltip } from '../../OverflowingTextWithTooltip';
import { type OverflowingTextWithTooltipProps } from '../../types/OverflowingTextWithTooltipProps';

const PORTAL_MOUNT_DELAY_MS = 150;
const PORTAL_SOURCE_WIDTH = 200;
const PORTAL_SOURCE_HEIGHT = 30;

type PortalMountEffectProps = {
  isSourceHovered: boolean;
  sourceElementRef: RefObject<HTMLDivElement | null>;
  onPortalMount: (element: HTMLDivElement | null) => void;
};

const PortalMountEffect = ({
  isSourceHovered,
  sourceElementRef,
  onPortalMount,
}: PortalMountEffectProps) => {
  useEffect(() => {
    if (!isSourceHovered) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => onPortalMount(sourceElementRef.current),
      PORTAL_MOUNT_DELAY_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [isSourceHovered, sourceElementRef, onPortalMount]);

  return null;
};

export const OverflowingTextMountedUnderPointer = (
  props: OverflowingTextWithTooltipProps,
) => {
  const sourceElementRef = useRef<HTMLDivElement>(null);
  const [isSourceHovered, setIsSourceHovered] = useState(false);
  const [portalAnchor, setPortalAnchor] = useState<HTMLDivElement | null>(null);
  const [initialPointerPosition, setInitialPointerPosition] = useState<
    Pick<MouseEvent, 'clientX' | 'clientY'> | undefined
  >(undefined);

  return (
    <Text
      ref={sourceElementRef}
      truncate
      data-testid="portal-source"
      onMouseEnter={() => setIsSourceHovered(true)}
      onPointerEnter={({ clientX, clientY }) =>
        setInitialPointerPosition({ clientX, clientY })
      }
      style={{
        position: 'relative',
        width: PORTAL_SOURCE_WIDTH,
        height: PORTAL_SOURCE_HEIGHT,
        lineHeight: `${PORTAL_SOURCE_HEIGHT}px`,
      }}
    >
      {props.text}
      <PortalMountEffect
        isSourceHovered={isSourceHovered}
        sourceElementRef={sourceElementRef}
        onPortalMount={setPortalAnchor}
      />
      {isDefined(portalAnchor) &&
        createPortal(
          <OverflowingTextWithTooltip
            {...props}
            initialPointerPosition={initialPointerPosition}
            data-testid="overflow-text"
            style={{
              ...props.style,
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background: 'var(--t-background-primary)',
            }}
          />,
          portalAnchor,
        )}
    </Text>
  );
};
