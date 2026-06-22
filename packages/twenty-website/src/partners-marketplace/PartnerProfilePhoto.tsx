import { styled } from '@linaria/react';

import { color, radius } from '@/tokens';

import { isSafeHttpUrl } from './is-safe-http-url';
import { PartnerAvatar } from './PartnerAvatar';

// Squared tile, not a circle: it reads as a studio/brand image and matches the
// rectangular rail + crosshair geometry instead of fighting it.
const PhotoWrapper = styled.div`
  aspect-ratio: 1 / 1;
  border-radius: ${radius(2)};
  overflow: hidden;
  width: 100%;
`;

const RealPhoto = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const AvatarSizer = styled.div`
  align-items: center;
  aspect-ratio: 1 / 1;
  background-color: ${color('blue-5')};
  border-radius: ${radius(2)};
  display: flex;
  justify-content: center;
  overflow: hidden;
  width: 100%;
`;

export function PartnerProfilePhoto({
  name,
  slug,
  profilePictureUrl,
}: {
  name: string;
  slug: string;
  profilePictureUrl: string;
}) {
  if (isSafeHttpUrl(profilePictureUrl)) {
    return (
      <PhotoWrapper>
        <RealPhoto alt={name} src={profilePictureUrl} />
      </PhotoWrapper>
    );
  }

  return (
    <AvatarSizer>
      <PartnerAvatar name={name} slug={slug} />
    </AvatarSizer>
  );
}
