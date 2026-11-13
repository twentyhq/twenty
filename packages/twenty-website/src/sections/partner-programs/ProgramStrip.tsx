import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { color, mediaUp, radius, semanticColor, spacing } from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

const SwitchRow = styled.div`
  align-items: center;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  column-gap: ${spacing(6)};
  display: flex;
  flex-direction: column;
  padding: ${spacing(6)};
  row-gap: ${spacing(4)};

  ${mediaUp('sm')} {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const SwitchCopy = styled.div`
  max-width: 520px;

  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

type ProgramStripProps = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
  action: ReactNode;
};

export function ProgramStrip({ heading, body, action }: ProgramStripProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="muted">
      <SwitchRow>
        <SwitchCopy>
          <Heading as="h2" size="xs" weight="regular">
            {i18n._(heading)}
          </Heading>
          <Body muted size="sm">
            {i18n._(body)}
          </Body>
        </SwitchCopy>
        {action}
      </SwitchRow>
    </SectionShell>
  );
}
