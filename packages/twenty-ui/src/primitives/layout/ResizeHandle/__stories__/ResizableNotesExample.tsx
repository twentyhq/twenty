import { useId, useState } from 'react';

import { ResizeHandle } from '@ui/primitives/layout/ResizeHandle/ResizeHandle';
import { type ResizeHandleProps } from '@ui/primitives/layout/ResizeHandle/types/ResizeHandleProps';
import { Text } from '@ui/primitives/typography/Text/Text';

export const ResizableNotesExample = (
  props: Pick<ResizeHandleProps, 'disabled' | 'step' | 'min' | 'max'>,
) => {
  const panelId = useId();
  const [height, setHeight] = useState(150);

  return (
    <Text style={{ display: 'flex', flexDirection: 'column', width: 300 }}>
      <Text id={panelId} style={{ height, overflow: 'auto' }}>
        Record notes
      </Text>
      <ResizeHandle
        axis="y"
        defaultValue={150}
        onValueChange={setHeight}
        min={50}
        max={500}
        {...props}
        aria-label="Resize notes height"
        aria-controls={panelId}
      />
    </Text>
  );
};
