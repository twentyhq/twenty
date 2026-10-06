import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { PanelResizeHandle } from '../PanelResizeHandle';
import { type PanelResizeHandleProps } from '../types/PanelResizeHandleProps';

export const UnmountingPanelResizeHandle = ({
  onSizePreview,
  onSizeCommitted,
  ...props
}: PanelResizeHandleProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [committedSize, setCommittedSize] = useState(props.size);
  const [liveSize, setLiveSize] = useState(props.size);

  return (
    <>
      {isVisible && (
        <PanelResizeHandle
          {...props}
          size={committedSize}
          onSizePreview={(size) => {
            setLiveSize(size);
            onSizePreview?.(size);
          }}
          onSizeCommitted={(size) => {
            setCommittedSize(size);
            onSizeCommitted?.(size);
          }}
        />
      )}
      <Text>Live size: {liveSize}</Text>
      <Button onClick={() => setIsVisible(false)}>Hide panel</Button>
    </>
  );
};
