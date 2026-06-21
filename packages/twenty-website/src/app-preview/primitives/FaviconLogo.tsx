'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { createBoundedFailureCache } from '@/platform/visuals/engine/bounded-failure-cache';

import { getInitials } from './get-initials';
import { sharedAssetUrls } from '../data/shared-asset-urls';

const failedFaviconUrls = createBoundedFailureCache(256);

const FaviconFrame = styled.div<{ $size: number }>`
  align-items: center;
  border-radius: ${THEME_LIGHT.border.radius.xs};
  display: flex;
  flex: 0 0 auto;
  font-family: ${THEME_LIGHT.font.family};
  font-size: ${({ $size }) => ($size <= 14 ? '8px' : '9px')};
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
  height: ${({ $size }) => `${$size}px`};
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: ${({ $size }) => `${$size}px`};
`;

const FaviconFallbackFrame = styled(FaviconFrame)`
  background: ${THEME_LIGHT.border.color.medium};
  color: ${THEME_LIGHT.font.color.secondary};
`;

const FaviconImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

function sanitizeUrl(link: string | null | undefined) {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
}

function getLogoUrlFromDomainName(domainName?: string): string | undefined {
  const sharedLogoUrl = sharedAssetUrls.companyLogoForDomain(domainName);
  if (sharedLogoUrl) {
    return sharedLogoUrl;
  }
  const sanitizedDomain = sanitizeUrl(domainName);
  return sanitizedDomain
    ? `https://twenty-icons.com/${sanitizedDomain}`
    : undefined;
}

export function FaviconLogo({
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
  const faviconUrl = src ?? getLogoUrlFromDomainName(domain);
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
          // Opts the mockup's chrome out of React 19's SSR image preloading,
          // which would otherwise preload third-party favicons in <head>.
          fetchPriority="low"
          src={faviconUrl}
          onError={() => {
            failedFaviconUrls.add(faviconUrl);
            setLocalFailedUrl(faviconUrl);
          }}
        />
      </FaviconFrame>
    );
  }

  const initials = label ? getInitials(label) : '?';
  return (
    <FaviconFallbackFrame $size={size}>
      {initials.slice(0, 1)}
    </FaviconFallbackFrame>
  );
}
