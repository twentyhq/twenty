import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useCallback, useId, useRef, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { Text } from '@ui/primitives/typography/Text/Text';

import { ResizablePanel } from '../ResizablePanel';
import { type ResizablePanelProps } from '../types/ResizablePanelProps';

export const ResizablePanelDemo = ({
  side = 'right',
  variant = 'edge',
  min,
  max,
}: Pick<ResizablePanelProps, 'side' | 'variant' | 'min' | 'max'>) => {
  const regionId = useId();
  const separatorRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(220);
  const [committedSize, setCommittedSize] = useState(220);
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

  const isHorizontal = side === 'left' || side === 'right';
  const isBefore = side === 'left' || side === 'top';
  const adjacentPanel = (
    <Card.Root style={{ padding: 24 }}>
      <Text>Activity</Text>
    </Card.Root>
  );
  const separator = (
    <ResizablePanel
      ref={mergedSeparatorRef}
      side={side}
      variant={variant}
      gapSize={12}
      aria-label="Resize notes"
      aria-controls={regionId}
      size={committedSize}
      min={min}
      max={max}
      onSizeChange={setSize}
      onSizeCommit={setCommittedSize}
      onCollapse={collapseNotes}
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
      {variant === 'gap' && isBefore && adjacentPanel}
      {variant === 'gap' && isBefore && separator}
      <Card.Root
        id={regionId}
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
        {variant === 'edge' && separator}
      </Card.Root>
      {variant === 'gap' && !isBefore && separator}
      {variant === 'gap' && !isBefore && adjacentPanel}
    </div>
  );
};
