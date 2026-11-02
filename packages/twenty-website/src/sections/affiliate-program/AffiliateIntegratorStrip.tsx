import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { color, mediaUp, radius, semanticColor, spacing } from '@/tokens';
import { Body, Button, Heading, SectionShell } from '@/ui';

const IntegratorRow = styled.div`
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

const IntegratorCopy = styled.div`
  max-width: 520px;

  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

export function AffiliateIntegratorStrip() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="muted">
      <IntegratorRow>
        <IntegratorCopy>
          <Heading as="h2" size="xs" weight="regular">
            {i18n._(msg`Already a Twenty *integration partner?*`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(
              msg`Tick the box in the form and we link your application to your existing partner record, so you can be in both programs.`,
            )}
          </Body>
        </IntegratorCopy>
        <Button
          href="#apply"
          label={i18n._(msg`Join the program`)}
          variant="outlined"
        />
      </IntegratorRow>
    </SectionShell>
  );
}
