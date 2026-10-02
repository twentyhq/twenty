import { clamp } from '@base-ui/utils/clamp';
import { useControlled } from '@base-ui/utils/useControlled';
import { clsx } from 'clsx';
import { type CSSProperties, useRef, useState } from 'react';

import { ResizeHandle } from '@ui/primitives/layout/ResizeHandle/ResizeHandle';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { RESIZABLE_PANEL_DRAG_THRESHOLD } from './internal/ResizablePanelDragThreshold.constant';
import styles from './ResizablePanel.module.scss';
import { type ResizablePanelProps } from './types/ResizablePanelProps';

export const ResizablePanel = ({
  side,
  variant = 'edge',
  size: controlledSize,
  defaultSize,
  min,
  max,
  gapSize = 0,
  showHandle = true,
  disabled = false,
  onSizeChange,
  onSizeCommit,
  onResizeStart,
  onResizeEnd,
  onCollapse,
  className,
  style,
  ...props
}: ResizablePanelProps) => {
  const [uncontrolledDefaultSize] = useState(defaultSize ?? min);
  const [size, setSize] = useControlled({
    controlled: controlledSize,
    default: uncontrolledDefaultSize,
    name: 'ResizablePanel',
  });
  const boundedSize = clamp(size, min, max);
  const [draftSize, setDraftSize] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const startSizeRef = useRef(boundedSize);
  const isVertical = side === 'top' || side === 'bottom';
  const isReverse = side === 'left' || side === 'top';

  const handleSizeChange = (nextSize: number) => {
    setDraftSize(nextSize);
    onSizeChange?.(nextSize);
  };

  const handleSizeCommit = (nextSize: number) => {
    setSize(nextSize);
    setDraftSize(null);
    onSizeCommit?.(nextSize);
  };

  const handleResizeStart = (nextSize: number) => {
    startSizeRef.current = boundedSize;
    setIsResizing(true);
    onResizeStart?.(nextSize);
  };

  const handleResizeEnd = ({
    cancelled,
    value,
  }: {
    cancelled: boolean;
    value: number;
  }) => {
    const finalSize = cancelled ? clamp(startSizeRef.current, min, max) : value;

    if (cancelled) {
      onSizeChange?.(finalSize);
    }

    setDraftSize(null);
    setIsResizing(false);
    onResizeEnd?.({ cancelled, value: finalSize });
  };

  return (
    <ResizeHandle
      {...props}
      axis={isVertical ? 'y' : 'x'}
      direction={isReverse ? 'reverse' : 'normal'}
      value={draftSize ?? boundedSize}
      min={min}
      max={max}
      dragThreshold={RESIZABLE_PANEL_DRAG_THRESHOLD}
      disabled={disabled}
      onValueChange={handleSizeChange}
      onValueCommit={handleSizeCommit}
      onResizeStart={handleResizeStart}
      onResizeEnd={handleResizeEnd}
      onActivate={onCollapse}
      aria-keyshortcuts={
        props['aria-keyshortcuts'] ??
        (isDefined(onCollapse) && !disabled ? 'Enter Space' : undefined)
      }
      data-side={side}
      data-variant={variant}
      data-resizing={isResizing || undefined}
      className={clsx(styles.root, className)}
      style={
        { '--resizable-panel-gap': `${gapSize}px`, ...style } as CSSProperties
      }
    >
      {variant === 'edge' && showHandle ? (
        <div className={styles.bar} />
      ) : (
        false
      )}
    </ResizeHandle>
  );
};
