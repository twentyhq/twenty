import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Eyebrow, Heading, SectionShell } from '@/ui';

type PartnersStageService = {
  title: MessageDescriptor;
  body: MessageDescriptor;
};

const SERVICES: readonly PartnersStageService[] = [
  {
    title: msg`Migration`,
    body: msg`Move your data out of Salesforce, HubSpot or spreadsheets.`,
  },
  {
    title: msg`Customization & apps`,
    body: msg`Custom objects, workflows and apps built on the platform.`,
  },
  {
    title: msg`Self-hosted operations`,
    body: msg`Deploy, upgrade and operate Twenty on your own infrastructure.`,
  },
  {
    title: msg`Training & RevOps`,
    body: msg`Onboard your team and design your sales process.`,
  },
];

const Intro = styled.div`
  max-width: 560px;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

// Four columns on one rule: the services read as a line-up, not as cards.
const ServiceLine = styled.ol`
  border-top: 1px solid ${semanticColor.ink};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  margin-top: ${spacing(10)};

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const ServiceItem = styled.li`
  border-bottom: 1px solid ${semanticColor.line};
  padding: ${spacing(6)} ${spacing(6)} ${spacing(8)} 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }

  ${mediaUp('lg')} {
    border-bottom: none;
    border-left: 1px solid ${semanticColor.line};
    padding: ${spacing(6)} ${spacing(6)} ${spacing(2)};

    &:first-child {
      border-left: none;
      padding-left: 0;
    }
  }
`;

const ServiceIndex = styled.span`
  color: ${color('blue')};
  display: block;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  padding-bottom: ${spacing(6)};
`;

const ServiceTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.02em;
  line-height: 1.25;
`;

// PROTOTYPE
export function PartnersStageServices() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="muted">
      <Intro>
        <Eyebrow>{i18n._(msg`Services`)}</Eyebrow>
        <Heading as="h2" size="md" weight="light">
          {i18n._(msg`What a Twenty partner does`)}
        </Heading>
        <Body muted size="md">
          {i18n._(
            msg`Four kinds of work, delivered by teams that build on Twenty every day.`,
          )}
        </Body>
      </Intro>
      <ServiceLine>
        {SERVICES.map((service, index) => (
          <ServiceItem key={service.title.id}>
            <ServiceIndex aria-hidden>
              {String(index + 1).padStart(2, '0')}
            </ServiceIndex>
            <ServiceTitle>{i18n._(service.title)}</ServiceTitle>
            <Body muted size="sm">
              {i18n._(service.body)}
            </Body>
          </ServiceItem>
        ))}
      </ServiceLine>
    </SectionShell>
  );
}
