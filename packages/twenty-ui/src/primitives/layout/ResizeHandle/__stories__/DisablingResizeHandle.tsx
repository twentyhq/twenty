import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { ResizeHandle } from '../ResizeHandle';
import { type ResizeHandleProps } from '../types/ResizeHandleProps';

export const DisablingResizeHandle = (props: ResizeHandleProps) => {
  const [disabled, setDisabled] = useState(false);

  return (
    <>
      <ResizeHandle {...props} disabled={disabled} />
      <Button onClick={() => setDisabled(true)}>Disable resizing</Button>
    </>
  );
};
