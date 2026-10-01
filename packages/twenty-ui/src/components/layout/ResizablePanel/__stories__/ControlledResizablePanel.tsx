import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { ResizablePanel } from '../ResizablePanel';
import { type ResizablePanelProps } from '../types/ResizablePanelProps';

export const ControlledResizablePanel = ({
  onSizeChange,
  onSizeCommit,
  ...props
}: ResizablePanelProps) => {
  const [size, setSize] = useState(200);
  const [liveSize, setLiveSize] = useState(200);

  return (
    <>
      <ResizablePanel
        {...props}
        size={size}
        onSizeChange={(nextSize) => {
          setLiveSize(nextSize);
          onSizeChange?.(nextSize);
        }}
        onSizeCommit={(nextSize) => {
          setSize(nextSize);
          onSizeCommit?.(nextSize);
        }}
      />
      <Text>Live size: {liveSize}</Text>
      <Text>Saved size: {size}</Text>
      <Button
        onClick={() => {
          setSize(240);
          setLiveSize(240);
        }}
      >
        Restore saved size
      </Button>
    </>
  );
};
