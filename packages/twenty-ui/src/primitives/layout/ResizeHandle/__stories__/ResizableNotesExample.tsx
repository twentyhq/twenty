import { useId, useState } from 'react';

import { ResizeHandle } from '@ui/primitives/layout/ResizeHandle/ResizeHandle';
import { type ResizeHandleProps } from '@ui/primitives/layout/ResizeHandle/types/ResizeHandleProps';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { Text } from '@ui/primitives/typography/Text/Text';

export const ResizableNotesExample = (
  props: Pick<ResizeHandleProps, 'disabled' | 'step' | 'min' | 'max'>,
) => {
  const panelId = useId();
  const [height, setHeight] = useState(150);

  return (
    <Card.Root style={{ width: 300, maxWidth: '100%' }}>
      <Text
        id={panelId}
        style={{
          height,
          overflow: 'auto',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >
        <Text
          style={{
            color: 'var(--t-font-color-primary)',
            fontWeight: 'var(--t-font-weight-medium)',
          }}
        >
          Record notes
        </Text>
        <Text style={{ marginTop: 8, lineHeight: 1.5 }}>
          Follow up with Morgan about the proposal. Share the revised timeline
          before Friday.
        </Text>
      </Text>
      <Text style={{ padding: 4 }}>
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
    </Card.Root>
  );
};
