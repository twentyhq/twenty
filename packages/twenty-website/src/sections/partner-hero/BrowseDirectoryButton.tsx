'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';

import { PARTNER_DIRECTORY_ANCHOR_ID } from '@/platform/routing/partner-directory-anchor-id';
import { Button } from '@/ui';

// The stock Button treats every href that is not a route as external, so the
// in-page jump runs through onClick (the case-study nav's pattern).
export function BrowseDirectoryButton() {
  const { i18n } = useLingui();

  return (
    <Button
      label={i18n._(msg`Browse partners`)}
      onClick={() =>
        document.getElementById(PARTNER_DIRECTORY_ANCHOR_ID)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
      variant="outlined"
    />
  );
}
