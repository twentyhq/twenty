'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { type MouseEvent } from 'react';

import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import { Button } from '@/ui';

// The anchor is the contract and the smooth scroll only decorates it (the
// case-study nav's pattern): the jump still works before hydration and the
// directory heading takes focus, which scrollIntoView alone never moves.
const scrollToDirectory = (event: MouseEvent<HTMLElement>) => {
  const target = document.getElementById(PARTNER_DIRECTORY_ANCHOR_ID);
  if (target === null) return;

  event.preventDefault();
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
    block: 'start',
  });
  target.focus({ preventScroll: true });
};

export function BrowseDirectoryButton() {
  const { i18n } = useLingui();

  return (
    <Button
      href={`#${PARTNER_DIRECTORY_ANCHOR_ID}`}
      label={i18n._(msg`Browse partners`)}
      onClick={scrollToDirectory}
      variant="outlined"
    />
  );
}
