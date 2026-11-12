import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { color, mediaUp, radius, semanticColor, spacing } from '@/tokens';
import { Body, Button, Heading, SectionShell } from '@/ui';

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

type ProgramSwitchStripProps = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
  label: MessageDescriptor;
  href: string;
};

// Points people who landed on the other program's page to the one that fits them.
export function ProgramSwitchStrip({ heading, body, label, href }: ProgramSwitchStripProps) {
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
        <Button href={href} label={i18n._(label)} variant="outlined" />
      </SwitchRow>
    </SectionShell>
  );
}
