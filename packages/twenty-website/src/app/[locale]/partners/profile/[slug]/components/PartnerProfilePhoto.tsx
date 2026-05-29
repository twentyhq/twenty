import { styled } from '@linaria/react';

import { PartnerAvatar } from '@/app/[locale]/partners/list/components/PartnerAvatar';
import { theme } from '@/theme';

// Squared tile, not a circle: it reads as a studio/brand image and matches the
// rectangular panel + crosshair geometry instead of fighting it.
const PhotoWrapper = styled.div`
  aspect-ratio: 1 / 1;
  border-radius: ${theme.radius(2)};
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
  background-color: rgba(74, 56, 245, 0.06);
  border-radius: ${theme.radius(2)};
  display: flex;
  justify-content: center;
  overflow: hidden;
  width: 100%;
`;

const isSafeHttpUrl = (raw: string) => {
  try {
    return ['https:', 'http:'].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
};

type PartnerProfilePhotoProps = {
  name: string;
  slug: string;
  profilePictureUrl: string;
};

export function PartnerProfilePhoto({
  name,
  slug,
  profilePictureUrl,
}: PartnerProfilePhotoProps) {
  const showRealPhoto = isSafeHttpUrl(profilePictureUrl);

  if (showRealPhoto) {
    return (
      <PhotoWrapper>
        <RealPhoto src={profilePictureUrl} alt={name} />
      </PhotoWrapper>
    );
  }

  return (
    <AvatarSizer>
      <PartnerAvatar name={name} slug={slug} aria-hidden="true" />
    </AvatarSizer>
  );
}
