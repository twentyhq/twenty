import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useCallback, useId, useRef, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { Text } from '@ui/primitives/typography/Text/Text';

import { RESIZE_HANDLE_DEFAULTS } from '../internal/ResizeHandleDefaults.constant';
import { ResizeHandle } from '../ResizeHandle';
import { type ResizeHandleProps } from '../types/ResizeHandleProps';

export const ResizeHandlePanelDemo = ({
  edge = 'right',
  placement = 'edge',
  min,
  max,
  value: initialSize = RESIZE_HANDLE_DEFAULTS.value,
}: Pick<ResizeHandleProps, 'edge' | 'placement' | 'min' | 'max' | 'value'>) => {
  const regionId = useId();
  const separatorRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(initialSize);
  const [committedSize, setCommittedSize] = useState(initialSize);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shouldFocusOnMount, setShouldFocusOnMount] = useState(false);

  const focusOnMount = useCallback(
    (element: HTMLElement | null) => {
      if (shouldFocusOnMount) {
        element?.focus();
      }
    },
    [shouldFocusOnMount],
  );
  const mergedSeparatorRef = useMergedRefs(separatorRef, focusOnMount);

  const collapseNotes = () => {
    setShouldFocusOnMount(separatorRef.current === document.activeElement);
    setIsCollapsed(true);
  };

  const showNotes = () => {
    setShouldFocusOnMount(true);
    setIsCollapsed(false);
  };

  const isHorizontal = edge === 'left' || edge === 'right';
  const gapStyle = isHorizontal ? { width: 12 } : { height: 12 };
  const isBefore = edge === 'left' || edge === 'top';
  const adjacentPanel = (
    <Card.Root role="region" aria-label="Activity" style={{ padding: 24 }}>
      <Text>Activity</Text>
    </Card.Root>
  );
  const separator = (
    <ResizeHandle
      ref={mergedSeparatorRef}
      edge={edge}
      placement={placement}
      style={placement === 'gap' ? gapStyle : undefined}
      aria-label="Resize notes"
      aria-controls={regionId}
      value={size}
      min={min}
      max={max}
      onValueChange={setSize}
      onValueCommitted={setCommittedSize}
      onActivate={collapseNotes}
    />
  );

  if (isCollapsed) {
    return (
      <Button ref={focusOnMount} onClick={showNotes}>
        Show notes
      </Button>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        width: isHorizontal ? 'auto' : 320,
      }}
    >
      {placement === 'gap' && isBefore && adjacentPanel}
      {placement === 'gap' && isBefore && separator}
      <Card.Root
        id={regionId}
        role="region"
        aria-label="Notes"
        style={{
          position: 'relative',
          overflow: 'visible',
          boxSizing: 'border-box',
          height: isHorizontal ? 180 : size,
          width: isHorizontal ? size : 320,
          padding: 24,
        }}
      >
        <Text>Notes</Text>
        <Text>{size} pixels</Text>
        <Text>Saved: {committedSize} pixels</Text>
        {placement === 'edge' && separator}
      </Card.Root>
      {placement === 'gap' && !isBefore && separator}
      {placement === 'gap' && !isBefore && adjacentPanel}
    </div>
  );
};
