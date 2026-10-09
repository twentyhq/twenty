import { useState } from 'react';

import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { Button } from '@ui/primitives/input/Button/Button';

export const AvatarGroupStatefulAvatar = ({ name }: { name: string }) => {
  const [selectionCount, setSelectionCount] = useState(0);

  return (
    <Button
      aria-label={`${name} selected ${selectionCount} times`}
      onClick={() => setSelectionCount((count) => count + 1)}
      startIcon={<Avatar name={name} size="sm" />}
      size="sm"
    >
      {selectionCount}
    </Button>
  );
};
