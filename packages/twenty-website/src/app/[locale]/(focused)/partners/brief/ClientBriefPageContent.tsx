'use client';

import { styled } from '@linaria/react';

import { ClientBriefWizard } from '@/client-brief';
import { buildSchemeContext, mediaUp, MODAL_SURFACE, spacing } from '@/tokens';

const BriefBackground = styled.div`
  ${buildSchemeContext('dark')}
  align-items: center;
  background: ${MODAL_SURFACE.panel};
  display: flex;
  justify-content: center;
  min-height: 100dvh;
`;

const BriefContainer = styled.div`
  box-sizing: border-box;
  max-width: min(720px, 100%);
  padding: ${spacing(5)} ${spacing(4)};
  width: 100%;

  ${mediaUp('md')} {
    padding: ${spacing(6)};
  }
`;

export function ClientBriefPageContent() {
  return (
    <BriefBackground data-scheme="dark">
      <BriefContainer>
        <ClientBriefWizard resetSignal={0} />
      </BriefContainer>
    </BriefBackground>
  );
}
