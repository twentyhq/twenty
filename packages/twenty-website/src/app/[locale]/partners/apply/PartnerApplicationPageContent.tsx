'use client';

import { PartnerApplicationWizard } from '@/sections/PartnerApplication/wizard/PartnerApplicationWizard';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRouter } from 'next/navigation';
import { type ReactElement } from 'react';

function PassTitle({ render }: { render?: ReactElement }) {
  return <>{render}</>;
}

function PassDescription({ render }: { render?: ReactElement }) {
  return <>{render}</>;
}

const PAGE_SLOTS = { Title: PassTitle, Description: PassDescription };

const ApplyPageContainer = styled.div`
  background: #0c0c0c;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  margin-left: auto;
  margin-right: auto;
  max-width: min(720px, 100%);
  min-height: 100vh;
  padding: ${theme.spacing(5)} ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: ${theme.spacing(6)};
  }
`;

export function PartnerApplicationPageContent() {
  const router = useRouter();

  return (
    <ApplyPageContainer>
      <PartnerApplicationWizard
        resetSignal={0}
        onSuccess={() => router.push('/partners/list')}
        slots={PAGE_SLOTS}
      />
    </ApplyPageContainer>
  );
}
