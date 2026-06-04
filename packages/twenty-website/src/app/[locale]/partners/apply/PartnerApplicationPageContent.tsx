'use client';

import { PartnerApplicationWizard } from '@/sections/PartnerApplication/wizard/PartnerApplicationWizard';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useRouter } from 'next/navigation';
import { useState, type ReactElement } from 'react';

function PassTitle({ render }: { render?: ReactElement }) {
  return <>{render}</>;
}

function PassDescription({ render }: { render?: ReactElement }) {
  return <>{render}</>;
}

const PAGE_SLOTS = { Title: PassTitle, Description: PassDescription };

const ApplyPageWrapper = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  min-height: 100vh;
  padding: ${theme.spacing(8)} ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: ${theme.spacing(12)} ${theme.spacing(6)};
  }
`;

const ApplyPageCard = styled.div`
  background: #0c0c0c;
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  margin-left: auto;
  margin-right: auto;
  max-width: min(720px, 100%);
  overflow-y: auto;
  padding-bottom: ${theme.spacing(6)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(5)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(8)};
    padding-left: ${theme.spacing(6)};
    padding-right: ${theme.spacing(6)};
    padding-top: ${theme.spacing(6)};
  }
`;

export function PartnerApplicationPageContent() {
  const router = useRouter();
  const [resetSignal] = useState(0);

  return (
    <ApplyPageWrapper>
      <ApplyPageCard>
        <PartnerApplicationWizard
          resetSignal={resetSignal}
          onSuccess={() => router.push('/partners/list')}
          slots={PAGE_SLOTS}
        />
      </ApplyPageCard>
    </ApplyPageWrapper>
  );
}
