import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { RESIZE_HANDLE_DEFAULTS } from '../internal/ResizeHandleDefaults.constant';
import { ResizeHandle } from '../ResizeHandle';
import { type ResizeHandleProps } from '../types/ResizeHandleProps';

export const UnmountingResizeHandle = ({
  onValueChange,
  onValueCommitted,
  ...props
}: ResizeHandleProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [liveSize, setLiveSize] = useState(
    props.value ?? props.defaultValue ?? RESIZE_HANDLE_DEFAULTS.value,
  );

  return (
    <>
      {isVisible && (
        <ResizeHandle
          {...props}
          value={liveSize}
          onValueChange={(size) => {
            setLiveSize(size);
            onValueChange?.(size);
          }}
          onValueCommitted={onValueCommitted}
        />
      )}
      <Text>Live value: {liveSize}</Text>
      <Button onClick={() => setIsVisible(false)}>Hide panel</Button>
    </>
  );
};
