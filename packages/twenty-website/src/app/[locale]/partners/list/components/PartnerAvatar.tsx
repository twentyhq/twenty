import { theme } from '@/theme';
import { styled } from '@linaria/react';

const AVATAR_PALETTE = [
  theme.colors.accent.blue[100],
  theme.colors.accent.pink[100],
  theme.colors.accent.green[100],
];

const AvatarBlock = styled.span`
  align-items: center;
  border-radius: ${theme.radius(1.5)};
  color: ${theme.colors.secondary.text[100]};
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(5)};
  font-weight: ${theme.font.weight.light};
  height: 48px;
  justify-content: center;
  letter-spacing: -0.02em;
  line-height: 1;
  width: 48px;
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
};

export function PartnerAvatar({ name, slug }: PartnerAvatarProps) {
  const backgroundColor = pickPaletteColor(slug);
  const initials = pickInitials(name);

  return (
    <AvatarBlock aria-hidden="true" style={{ backgroundColor }}>
      {initials}
    </AvatarBlock>
  );
}
