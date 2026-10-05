import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { ResizeHandle } from '../ResizeHandle';
import { type ResizeHandleProps } from '../types/ResizeHandleProps';

export const ControlledResizeHandle = (props: ResizeHandleProps) => {
  const [value, setValue] = useState(200);

  return (
    <>
      <ResizeHandle {...props} value={value} />
      <Button onClick={() => setValue(300)}>Apply size</Button>
    </>
  );
};
