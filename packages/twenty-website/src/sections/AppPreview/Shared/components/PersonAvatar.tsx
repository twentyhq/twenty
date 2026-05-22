import { createBoundedFailureCache } from '@/lib/visual-runtime';
import { styled } from '@linaria/react';
import { useState } from 'react';

import type { CellPerson } from '../../types';

import { getInitials } from '../utils/get-initials';
import { PreviewAvatar } from './PreviewAvatar';

const failedAvatarUrls = createBoundedFailureCache(256);

type PersonIdentity = Pick<
  CellPerson,
  'avatarUrl' | 'kind' | 'name' | 'shortLabel' | 'tone'
>;

const AvatarImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

export function PersonAvatar({
  person,
  size = 14,
}: {
  person: PersonIdentity;
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
    <PreviewAvatar size={size} square={square} tone={person.tone}>
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
        (person.shortLabel ?? getInitials(person.name))
      )}
    </PreviewAvatar>
  );
}
