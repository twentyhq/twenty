import { styled } from '@linaria/react';

import { color, FONT_WEIGHT, fontFamily, fontSize, radius } from '@/tokens';

import { isSafeHttpUrl } from './is-safe-http-url';

// The three illustration accents, rotated deterministically by slug so a
// partner always gets the same colour. Dark ink rides on top — these are
// decorative fallbacks, not data.
const AVATAR_PALETTE: readonly string[] = [
  color('blue'),
  color('pink'),
  color('green'),
];

const AVATAR_SIZE_PX = 48;

const AvatarBlock = styled.span`
  align-items: center;
  border-radius: ${radius(1.5)};
  color: ${color('black')};
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(5)};
  font-weight: ${FONT_WEIGHT.light};
  height: ${AVATAR_SIZE_PX}px;
  justify-content: center;
  letter-spacing: -0.02em;
  line-height: 1;
  width: ${AVATAR_SIZE_PX}px;
`;

const AvatarImage = styled.img`
  border-radius: ${radius(1.5)};
  display: block;
  flex-shrink: 0;
  height: ${AVATAR_SIZE_PX}px;
  object-fit: cover;
  width: ${AVATAR_SIZE_PX}px;
`;

function pickPaletteColor(slug: string): string {
  if (slug.length === 0) return AVATAR_PALETTE[0];
  const index = (slug.charCodeAt(0) + slug.length) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

function pickInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

type PartnerAvatarProps = {
  name: string;
  slug: string;
  profilePictureUrl?: string;
};

export function PartnerAvatar({
  name,
  slug,
  profilePictureUrl,
}: PartnerAvatarProps) {
  // Show the partner's real picture when present; the initials block stays as
  // the fallback for partners without one. Decorative (alt="") because the
  // partner name is already rendered as text beside the avatar.
  if (profilePictureUrl !== undefined && isSafeHttpUrl(profilePictureUrl)) {
    return <AvatarImage src={profilePictureUrl} alt="" loading="lazy" />;
  }

  const backgroundColor = pickPaletteColor(slug);
  const initials = pickInitials(name);

  return (
    <AvatarBlock aria-hidden="true" style={{ backgroundColor }}>
      {initials}
    </AvatarBlock>
  );
}
