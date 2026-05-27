import { getSharedCompanyLogoUrlFromDomainName } from '@/content/site/asset-paths';
import { createBoundedFailureCache } from '@/lib/visual-runtime';
import { styled } from '@linaria/react';
import { useState } from 'react';

import { getInitials } from '../utils/get-initials';
import { APP_FONT } from '../utils/app-preview-theme';

const failedFaviconUrls = createBoundedFailureCache(256);

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

function sanitizeURL(link: string | null | undefined) {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
}

function getLogoUrlFromDomainName(domainName?: string): string | undefined {
  const sharedLogoUrl = getSharedCompanyLogoUrlFromDomainName(domainName);

  if (sharedLogoUrl) {
    return sharedLogoUrl;
  }

  const sanitizedDomain = sanitizeURL(domainName);

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
