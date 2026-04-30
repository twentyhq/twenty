import { getSharedCompanyLogoUrlFromDomainName } from '@/content/site/asset-paths';
import { createBoundedFailureCache } from '@/lib/visual-runtime';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';

import type { HeroCellPerson } from '@/sections/Hero/types';
import { APP_FONT } from './home-visual-theme';

const HOME_VISUAL_PERSON_TONES: Record<
  string,
  { background: string; color: string }
> = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  green: { background: '#dcfce7', color: '#15803d' },
  orange: { background: '#ffdcc3', color: '#ED5F00' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
};

const failedAvatarUrls = createBoundedFailureCache(256);
const failedFaviconUrls = createBoundedFailureCache(256);

type HomeVisualPersonIdentity = Pick<
  HeroCellPerson,
  'avatarUrl' | 'kind' | 'name' | 'shortLabel' | 'tone'
>;

const AvatarFrame = styled.div<{
  $background: string;
  $color: string;
  $size: number;
  $square?: boolean;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${({ $square }) => ($square ? '4px' : '999px')};
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 auto;
  font-family: ${APP_FONT};
  font-size: 10px;
  font-weight: ${theme.font.weight.medium};
  height: ${({ $size }) => `${$size}px`};
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: ${({ $size }) => `${$size}px`};
`;

const AvatarImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const FaviconFrame = styled.div<{ $size: number }>`
  align-items: center;
  border-radius: 4px;
  display: flex;
  flex: 0 0 auto;
  font-family: ${APP_FONT};
  font-size: ${({ $size }) => ($size <= 14 ? '8px' : '9px')};
  font-weight: 600;
  height: ${({ $size }) => `${$size}px`};
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: ${({ $size }) => `${$size}px`};
`;

const FaviconFallbackFrame = styled(FaviconFrame)`
  background: #ebebeb;
  color: #666666;
`;

const FaviconImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

export function getHomeVisualInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function sanitizeURL(link: string | null | undefined) {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
}

function getHomeVisualLogoUrlFromDomainName(
  domainName?: string,
): string | undefined {
  const sharedLogoUrl = getSharedCompanyLogoUrlFromDomainName(domainName);

  if (sharedLogoUrl) {
    return sharedLogoUrl;
  }

  const sanitizedDomain = sanitizeURL(domainName);

  return sanitizedDomain
    ? `https://twenty-icons.com/${sanitizedDomain}`
    : undefined;
}

export function HomeVisualFaviconLogo({
  domain,
  label,
  size = 14,
  src,
}: {
  domain?: string;
  label?: string;
  size?: number;
  src?: string;
}) {
  const faviconUrl = src ?? getHomeVisualLogoUrlFromDomainName(domain);
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showFavicon =
    faviconUrl !== undefined &&
    !failedFaviconUrls.has(faviconUrl) &&
    localFailedUrl !== faviconUrl;

  if (showFavicon) {
    return (
      <FaviconFrame $size={size}>
        <FaviconImage
          alt={label ? `${label} logo` : ''}
          src={faviconUrl}
          onError={() => {
            failedFaviconUrls.add(faviconUrl);
            setLocalFailedUrl(faviconUrl);
          }}
        />
      </FaviconFrame>
    );
  }

  const initials = label ? getHomeVisualInitials(label) : '?';

  return (
    <FaviconFallbackFrame $size={size}>
      {initials.slice(0, 1)}
    </FaviconFallbackFrame>
  );
}

export function HomeVisualAvatar({
  children,
  size = 14,
  square = false,
  tone = 'gray',
}: {
  children: ReactNode;
  size?: number;
  square?: boolean;
  tone?: string;
}) {
  const resolvedTone =
    HOME_VISUAL_PERSON_TONES[tone] ?? HOME_VISUAL_PERSON_TONES.gray;

  return (
    <AvatarFrame
      $background={resolvedTone.background}
      $color={resolvedTone.color}
      $size={size}
      $square={square}
    >
      {children}
    </AvatarFrame>
  );
}

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
