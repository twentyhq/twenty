import { createBoundedFailureCache } from '@/lib/visual-runtime';
import { styled } from '@linaria/react';
import { useState } from 'react';

import type { HeroCellPerson } from '@/sections/Hero/types';

import { getHomeVisualInitials } from '../utils/get-home-visual-initials';
import { HomeVisualAvatar } from './HomeVisualAvatar';

const failedAvatarUrls = createBoundedFailureCache(256);

type HomeVisualPersonIdentity = Pick<
  HeroCellPerson,
  'avatarUrl' | 'kind' | 'name' | 'shortLabel' | 'tone'
>;

const AvatarImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

export function HomeVisualPersonAvatar({
  person,
  size = 14,
}: {
  person: HomeVisualPersonIdentity;
  size?: number;
}) {
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const square =
    person.kind === 'api' ||
    person.kind === 'system' ||
    person.kind === 'workflow';
  const showAvatar =
    person.avatarUrl !== undefined &&
    !failedAvatarUrls.has(person.avatarUrl) &&
    localFailedUrl !== person.avatarUrl;

  return (
    <HomeVisualAvatar size={size} square={square} tone={person.tone}>
      {showAvatar ? (
        <AvatarImage
          alt=""
          src={person.avatarUrl}
          onError={() => {
            if (person.avatarUrl) {
              failedAvatarUrls.add(person.avatarUrl);
              setLocalFailedUrl(person.avatarUrl);
            }
          }}
        />
      ) : (
        (person.shortLabel ?? getHomeVisualInitials(person.name))
      )}
    </HomeVisualAvatar>
  );
}
