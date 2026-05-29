import { styled } from '@linaria/react';

import { PartnerAvatar } from '@/app/[locale]/partners/list/components/PartnerAvatar';
import { theme } from '@/theme';

const PhotoWrapper = styled.div`
  border-radius: 50%;
  flex-shrink: 0;
  height: 200px;
  overflow: hidden;
  width: 200px;
`;

const RealPhoto = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const AvatarSizer = styled.div`
  align-items: center;
  background-color: ${theme.colors.primary.text[5]};
  border-radius: 50%;
  display: flex;
  height: 200px;
  justify-content: center;
  overflow: hidden;
  width: 200px;
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
