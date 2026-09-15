import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  DURATION,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
} from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

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

const ExplainerCard = styled.div`
  align-items: flex-start;
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  column-gap: ${spacing(4)};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  padding: ${spacing(5)} ${spacing(6)};
  transition: box-shadow ${DURATION.xs} ease;

  &:hover {
    box-shadow: ${SHADOW.card};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const ExplainerMarker = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  height: 7px;
  margin-top: ${spacing(2)};
  width: 14px;
`;

const ExplainerTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 1.3;
  margin-bottom: ${spacing(1)};
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
            <ExplainerCard key={service.title.id}>
              <ExplainerMarker aria-hidden />
              <div>
                <ExplainerTitle>{i18n._(service.title)}</ExplainerTitle>
                <Body muted size="sm">
                  {i18n._(service.body)}
                </Body>
              </div>
            </ExplainerCard>
          ))}
        </ExplainerStack>
      </ExplainerGrid>
    </SectionShell>
  );
}
