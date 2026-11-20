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
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { PARTNERS_STAGE_CRAFT_COLUMN } from './partners-stage-craft-column';

type CraftService = {
  title: MessageDescriptor;
  body: MessageDescriptor;
};

const SERVICES: readonly CraftService[] = [
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

// PROTOTYPE (?direction=e): the four kinds of work as one ruled sheet of
// cells, in the page column.
const Frame = styled.div`
  padding: ${spacing(12)} 0;
  ${PARTNERS_STAGE_CRAFT_COLUMN}

  & > * + * {
    margin-top: ${spacing(8)};
  }

  ${mediaUp('md')} {
    padding: ${spacing(20)} 0;
  }
`;

const Header = styled.div`
  max-width: 520px;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const Sheet = styled.ol`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  list-style: none;

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const Item = styled.li`
  border-bottom: 1px solid ${semanticColor.line};
  padding: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(2)};
  }

  &:last-child {
    border-bottom: none;
  }

  ${mediaUp('sm')} {
    &:nth-child(odd) {
      border-right: 1px solid ${semanticColor.line};
    }

    &:nth-child(n + 3) {
      border-bottom: none;
    }
  }

  ${mediaUp('lg')} {
    border-bottom: none;
    border-right: 1px solid ${semanticColor.line};

    &:last-child {
      border-right: none;
    }
  }
`;

const Index = styled.span`
  color: ${color('green')};
  display: block;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  padding-bottom: ${spacing(10)};
`;

const Title = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 24px;
`;

export function PartnersStageCraftServices() {
  const i18n = getServerI18n();

  return (
    <SectionShell flushInline rhythm="flush" scheme="dark">
      <Frame>
        <Header>
          <Heading as="h2" size="md" weight="light">
            {i18n._(msg`What a Twenty partner does`)}
          </Heading>
          <Body muted size="md">
            {i18n._(
              msg`Four kinds of work, delivered by teams that build on Twenty every day.`,
            )}
          </Body>
        </Header>

        <Sheet>
          {SERVICES.map((service, index) => (
            <Item key={service.title.id}>
              <Index aria-hidden>{String(index + 1).padStart(2, '0')}</Index>
              <Title>{i18n._(service.title)}</Title>
              <Body muted size="sm">
                {i18n._(service.body)}
              </Body>
            </Item>
          ))}
        </Sheet>
      </Frame>
    </SectionShell>
  );
}
