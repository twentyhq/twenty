'use client';

import { styled } from '@linaria/react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { type MouseEvent, type ReactNode } from 'react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  semanticColor,
  spacing,
} from '@/tokens';

// The case studies' back link (an arrow and a quiet label), shown at every
// width.
const StyledBackLink = styled(LocalizedLink)`
  align-items: center;
  align-self: flex-start;
  color: ${semanticColor.inkMuted};
  display: inline-flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  gap: ${spacing(1)};
  margin-bottom: ${spacing(3)};
  text-decoration: none;
  transition: color ${DURATION.xxs} ${EASING.gentle};

  &:hover {
    color: ${semanticColor.ink};
  }
`;

type NavigationWithBack = { canGoBack?: boolean };

// Whether the previous entry is a page of this site: the Navigation API
// says so where it exists; elsewhere, a same-origin referrer does.
const cameFromThisSite = (): boolean => {
  const navigation = (window as Window & { navigation?: NavigationWithBack })
    .navigation;
  if (typeof navigation?.canGoBack === 'boolean') {
    return navigation.canGoBack;
  }
  try {
    return (
      document.referrer !== '' &&
      new URL(document.referrer).origin === window.location.origin
    );
  } catch {
    return false;
  }
};

type BackLinkProps = {
  // Where to go when there is no page of this site to go back to (a shared
  // link, a new tab).
  href: string;
  children: ReactNode;
};

// Goes back as the browser's back button does, to the list as it was left
// (its filters, its scroll); opened directly, it goes to `href`.
export function BackLink({ href, children }: BackLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const isPlainClick =
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey;
    if (isPlainClick && cameFromThisSite()) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <StyledBackLink href={href} onClick={handleClick}>
      <IconArrowLeft aria-hidden size={16} stroke={1.5} />
      {children}
    </StyledBackLink>
  );
}
