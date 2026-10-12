import { useState } from 'react';

import { AvatarGroup } from '../AvatarGroup';
import { AvatarGroupStatefulAvatar } from './AvatarGroupStatefulAvatar';

export const AvatarGroupIdentityExample = () => {
  const [names, setNames] = useState(['Matthew', 'Sophie', 'Jane']);
  const [maxVisible, setMaxVisible] = useState(3);
  const [total, setTotal] = useState<number>();

  return (
    <AvatarGroup
      aria-label="Team members"
      role="group"
      avatars={names.map((name) => (
        <AvatarGroupStatefulAvatar key={name} name={name} />
      ))}
      maxVisible={maxVisible}
      total={total}
      overlapOffset="0px"
      onKeyDown={(event) => {
        if (event.key === 'r') {
          setNames((currentNames) => [
            ...currentNames.slice(1),
            ...currentNames.slice(0, 1),
          ]);
          return;
        }

        if (event.key === 'l') {
          setMaxVisible((currentMaxVisible) =>
            currentMaxVisible === 3 ? 2 : 3,
          );
          return;
        }

        if (event.key === 't') {
          setTotal((currentTotal) => (currentTotal === 20 ? undefined : 20));
        }
      }}
    />
  );
};
