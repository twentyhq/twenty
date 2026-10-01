import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { ResizablePanel } from '../ResizablePanel';
import { type ResizablePanelProps } from '../types/ResizablePanelProps';

export const UnmountingResizablePanel = ({
  onSizeChange,
  ...props
}: ResizablePanelProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [liveSize, setLiveSize] = useState(200);

  return (
    <>
      {isVisible && (
        <ResizablePanel
          {...props}
          onSizeChange={(size) => {
            setLiveSize(size);
            onSizeChange?.(size);
          }}
        />
      )}
      <Text>Live size: {liveSize}</Text>
      <Button onClick={() => setIsVisible(false)}>Hide panel</Button>
    </>
  );
};
