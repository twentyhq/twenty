import { useId, useState } from 'react';

import { Card } from '@ui/primitives/surfaces/Card/Card';
import { Text } from '@ui/primitives/typography/Text/Text';

import { ResizeHandle } from '../ResizeHandle';

export const ResizableDemo = ({ axis = 'y' }: { axis?: 'x' | 'y' }) => {
  const [size, setSize] = useState(150);
  const regionId = useId();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: axis === 'y' ? 'column' : 'row',
      }}
    >
      <Card.Root
        id={regionId}
        style={{
          height: axis === 'y' ? size : 150,
          width: axis === 'x' ? size : 300,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <Text>{size} pixels</Text>
      </Card.Root>
      <ResizeHandle
        aria-label={axis === 'y' ? 'Resize height' : 'Resize width'}
        aria-controls={regionId}
        axis={axis}
        value={size}
        onValueChange={setSize}
      />
    </div>
  );
};
