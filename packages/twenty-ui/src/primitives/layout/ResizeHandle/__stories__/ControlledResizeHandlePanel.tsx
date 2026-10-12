import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { RESIZE_HANDLE_DEFAULTS } from '../internal/ResizeHandleDefaults.constant';
import { ResizeHandle } from '../ResizeHandle';
import { type ResizeHandleProps } from '../types/ResizeHandleProps';

export const ControlledResizeHandlePanel = ({
  onValueChange,
  onValueCommitted,
  ...props
}: ResizeHandleProps) => {
  const initialSize =
    props.value ?? props.defaultValue ?? RESIZE_HANDLE_DEFAULTS.value;
  const [size, setSize] = useState(initialSize);
  const [liveSize, setLiveSize] = useState(initialSize);

  return (
    <>
      <ResizeHandle
        {...props}
        value={liveSize}
        onValueChange={(nextSize) => {
          setLiveSize(nextSize);
          onValueChange?.(nextSize);
        }}
        onValueCommitted={(nextSize) => {
          setSize(nextSize);
          onValueCommitted?.(nextSize);
        }}
      />
      <Text>Live value: {liveSize}</Text>
      <Text>Saved value: {size}</Text>
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
