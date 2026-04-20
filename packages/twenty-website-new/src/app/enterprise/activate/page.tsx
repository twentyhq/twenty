import { theme } from '@/theme';
import { css } from '@linaria/core';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import { EnterpriseActivateClient } from './EnterpriseActivateClient';

const activateFallbackClassName = css`
  box-sizing: border-box;
  color: ${theme.colors.primary.text[60]};
  margin-left: auto;
  margin-right: auto;
  margin-top: ${theme.spacing(12)};
  max-width: 700px;
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
`;

export const metadata: Metadata = {
  title: 'Enterprise activation | Twenty',
  description:
    'Complete activation for your Twenty self-hosted enterprise license.',
};

function EnterpriseActivateFallback() {
  return (
    <div className={activateFallbackClassName}>{'Loading activation…'}</div>
  );
}

export default function EnterpriseActivatePage() {
  return (
    <Suspense fallback={<EnterpriseActivateFallback />}>
      <EnterpriseActivateClient />
    </Suspense>
  );
}
