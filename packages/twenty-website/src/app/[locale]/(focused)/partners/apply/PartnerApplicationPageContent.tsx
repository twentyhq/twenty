'use client';

import { styled } from '@linaria/react';
import { useRouter } from 'next/navigation';

import { PartnerApplicationWizard } from '@/partner-application';
import { buildSchemeContext, mediaUp, MODAL_SURFACE, spacing } from '@/tokens';

// The full-page home of the wizard, on the same dark surface as the modal
// (#0c0c0c): data-scheme drives the Button's dark styling, buildSchemeContext
// resolves the semantic colours. The wizard owns its own internal rhythm.
const ApplyBackground = styled.div`
  ${buildSchemeContext('dark')}
  align-items: center;
  background: ${MODAL_SURFACE.panel};
  display: flex;
  justify-content: center;
  min-height: 100dvh;
`;

const ApplyContainer = styled.div`
  box-sizing: border-box;
  max-width: min(720px, 100%);
  padding: ${spacing(5)} ${spacing(4)};
  width: 100%;

  ${mediaUp('md')} {
    padding: ${spacing(6)};
  }
`;

export function PartnerApplicationPageContent() {
  const router = useRouter();

  return (
    <ApplyBackground data-scheme="dark">
      <ApplyContainer>
        <PartnerApplicationWizard
          onSuccess={() => router.push('/partners/list')}
          resetSignal={0}
        />
      </ApplyContainer>
    </ApplyBackground>
  );
}
