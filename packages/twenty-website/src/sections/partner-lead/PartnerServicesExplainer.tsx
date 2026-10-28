import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Eyebrow, ExplainerCard, Heading, SectionShell } from '@/ui';

import { PARTNER_SERVICES } from './partner-services.data';

const ExplainerGrid = styled.div`
  column-gap: ${spacing(10)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: ${spacing(8)};

  ${mediaUp('md')} {
    grid-template-columns: 340px minmax(0, 1fr);
  }
`;

const ExplainerAside = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    align-self: start;
    position: sticky;
    top: ${spacing(24)};
  }
`;

const ExplainerStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
`;

export function PartnerServicesExplainer() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="muted">
      <ExplainerGrid>
        <ExplainerAside>
          <Eyebrow>{i18n._(msg`Services`)}</Eyebrow>
          <Heading as="h2" size="sm" weight="light">
            {i18n._(msg`What a Twenty partner does`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(
              msg`Four kinds of work, delivered by teams that build on Twenty every day.`,
            )}
          </Body>
        </ExplainerAside>
        <ExplainerStack>
          {PARTNER_SERVICES.map((service) => (
            <ExplainerCard key={service.title.id} title={i18n._(service.title)}>
              <Body muted size="sm">
                {i18n._(service.body)}
              </Body>
            </ExplainerCard>
          ))}
        </ExplainerStack>
      </ExplainerGrid>
    </SectionShell>
  );
}
