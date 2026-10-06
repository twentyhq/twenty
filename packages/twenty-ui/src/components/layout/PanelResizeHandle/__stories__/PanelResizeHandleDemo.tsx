import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useCallback, useId, useRef, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { Text } from '@ui/primitives/typography/Text/Text';

import { PanelResizeHandle } from '../PanelResizeHandle';
import { type PanelResizeHandleProps } from '../types/PanelResizeHandleProps';

export const PanelResizeHandleDemo = ({
  edge = 'right',
  placement = 'edge',
  minSize,
  maxSize,
  size: initialSize,
}: Pick<
  PanelResizeHandleProps,
  'edge' | 'placement' | 'minSize' | 'maxSize' | 'size'
>) => {
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
  const isBefore = edge === 'left' || edge === 'top';
  const adjacentPanel = (
    <Card.Root style={{ padding: 24 }}>
      <Text>Activity</Text>
    </Card.Root>
  );
  const separator = (
    <PanelResizeHandle
      ref={mergedSeparatorRef}
      edge={edge}
      placement={placement}
      gapSize={12}
      aria-label="Resize notes"
      aria-controls={regionId}
      size={committedSize}
      minSize={minSize}
      maxSize={maxSize}
      onSizePreview={setSize}
      onSizeCommitted={setCommittedSize}
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
