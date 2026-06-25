import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { Suspense } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { Body, SectionShell } from '@/ui';

import { EnterpriseActivateClient } from './EnterpriseActivateClient';

const ReadingColumn = styled.div`
  margin-inline: auto;
  max-width: 640px;
  width: 100%;
`;

export function EnterpriseActivatePanel() {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="light">
      <ReadingColumn>
        <Suspense
          fallback={<Body size="sm">{i18n._(msg`Loading activation…`)}</Body>}
        >
          <EnterpriseActivateClient />
        </Suspense>
      </ReadingColumn>
    </SectionShell>
  );
}
