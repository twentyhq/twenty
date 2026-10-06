import { clamp } from '@base-ui/utils/clamp';
import { clsx } from 'clsx';
import { type CSSProperties, useRef, useState } from 'react';

import { ResizeHandle } from '@ui/primitives/layout/ResizeHandle/ResizeHandle';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { PANEL_RESIZE_HANDLE_DRAG_THRESHOLD } from './internal/PanelResizeHandleDragThreshold.constant';
import styles from './PanelResizeHandle.module.scss';
import { type PanelResizeHandleProps } from './types/PanelResizeHandleProps';

export const PanelResizeHandle = ({
  edge,
  placement = 'edge',
  size,
  minSize,
  maxSize,
  gapSize = 0,
  showGrip = true,
  disabled = false,
  onSizePreview,
  onSizeCommitted,
  onResizeStart,
  onResizeEnd,
  onActivate,
  className,
  style,
  ...props
}: PanelResizeHandleProps) => {
  const boundedSize = clamp(size, minSize, maxSize);
  const [draftSize, setDraftSize] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const startSizeRef = useRef(boundedSize);
  const isVertical = edge === 'top' || edge === 'bottom';
  const isReverse = edge === 'left' || edge === 'top';

  const handleSizePreview = (nextSize: number) => {
    setDraftSize(nextSize);
    onSizePreview?.(nextSize);
  };

  const handleSizeCommitted = (nextSize: number) => {
    setDraftSize(null);
    onSizeCommitted?.(nextSize);
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
    const finalSize = cancelled
      ? clamp(startSizeRef.current, minSize, maxSize)
      : value;

    if (cancelled) {
      onSizePreview?.(finalSize);
    }

    setDraftSize(null);
    setIsResizing(false);
    onResizeEnd?.({ cancelled, size: finalSize });
  };

  const handleStyle: CSSProperties & {
    '--panel-resize-handle-gap': string;
  } = { '--panel-resize-handle-gap': `${gapSize}px`, ...style };

  return (
    <ResizeHandle
      {...props}
      axis={isVertical ? 'y' : 'x'}
      direction={isReverse ? 'reverse' : 'normal'}
      value={draftSize ?? boundedSize}
      min={minSize}
      max={maxSize}
      dragThreshold={PANEL_RESIZE_HANDLE_DRAG_THRESHOLD}
      disabled={disabled}
      onValueChange={handleSizePreview}
      onValueCommit={handleSizeCommitted}
      onResizeStart={handleResizeStart}
      onResizeEnd={handleResizeEnd}
      onActivate={onActivate}
      aria-keyshortcuts={
        props['aria-keyshortcuts'] ??
        (isDefined(onActivate) && !disabled ? 'Enter Space' : undefined)
      }
      data-edge={edge}
      data-placement={placement}
      data-resizing={isResizing || undefined}
      className={clsx(styles.root, className)}
      style={handleStyle}
    >
      {placement === 'edge' && showGrip ? (
        <div className={styles.bar} />
      ) : (
        false
      )}
    </ResizeHandle>
  );
};
