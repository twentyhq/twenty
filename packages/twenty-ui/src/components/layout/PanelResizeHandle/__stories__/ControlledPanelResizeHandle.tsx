import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { PanelResizeHandle } from '../PanelResizeHandle';
import { type PanelResizeHandleProps } from '../types/PanelResizeHandleProps';

export const ControlledPanelResizeHandle = ({
  onSizePreview,
  onSizeCommitted,
  ...props
}: PanelResizeHandleProps) => {
  const initialSize = props.size;
  const [size, setSize] = useState(initialSize);
  const [liveSize, setLiveSize] = useState(initialSize);

  return (
    <>
      <PanelResizeHandle
        {...props}
        size={size}
        onSizePreview={(nextSize) => {
          setLiveSize(nextSize);
          onSizePreview?.(nextSize);
        }}
        onSizeCommitted={(nextSize) => {
          setSize(nextSize);
          onSizeCommitted?.(nextSize);
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
