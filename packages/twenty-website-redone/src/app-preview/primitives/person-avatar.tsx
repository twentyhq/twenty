'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import { createBoundedFailureCache } from '@/platform/visuals/engine/bounded-failure-cache';

import { PreviewAvatar } from './preview-avatar';
import { type CellPerson } from '../types';

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
          // Opts the mockup's chrome out of React 19's SSR image preloading,
          // which would otherwise push every avatar into <head> preloads.
          fetchPriority="low"
          src={person.avatarUrl}
          onError={() => {
            if (person.avatarUrl) {
              failedAvatarUrls.add(person.avatarUrl);
              setLocalFailedUrl(person.avatarUrl);
            }
          }}
        />
      ) : (
        (person.shortLabel ?? person.name.trim().charAt(0).toUpperCase())
      )}
    </PreviewAvatar>
  );
}
