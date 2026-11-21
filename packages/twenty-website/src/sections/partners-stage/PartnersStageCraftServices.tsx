import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Heading, ModelCardGrid, SectionIntro, SectionShell } from '@/ui';

const Block = styled.div`
  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    & > * + * {
      margin-top: ${spacing(12)};
    }
  }
`;

const HeadingMeasure = styled.div`
  max-width: 640px;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

type CraftService = {
  title: MessageDescriptor;
  body: MessageDescriptor;
  model: 'spaceship' | 'single-screen' | 'lock' | 'target';
};

const SERVICES: readonly CraftService[] = [
  {
    title: msg`Migration`,
    body: msg`Move your data out of Salesforce, HubSpot or spreadsheets.`,
    model: 'spaceship',
  },
  {
    title: msg`Customization & apps`,
    body: msg`Custom objects, workflows and apps built on the platform.`,
    model: 'single-screen',
  },
  {
    title: msg`Self-hosted operations`,
    body: msg`Deploy, upgrade and operate Twenty on your own infrastructure.`,
    model: 'lock',
  },
  {
    title: msg`Training & RevOps`,
    body: msg`Onboard your team and design your sales process.`,
    model: 'target',
  },
];

export function PartnersStageCraftServices() {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm rhythm="section" scheme="dark">
      <Block>
        <SectionIntro>
          <HeadingMeasure>
            <Heading as="h2" size="md" weight="light">
              {i18n._(msg`What a Twenty partner does`)}
            </Heading>
            <Body muted size="md">
              {i18n._(
                msg`Four kinds of work, delivered by teams that build on Twenty every day.`,
              )}
            </Body>
          </HeadingMeasure>
        </SectionIntro>
        <ModelCardGrid
          cards={SERVICES.map((service) => ({
            body: i18n._(service.body),
            model: service.model,
            title: i18n._(service.title),
          }))}
        />
      </Block>
    </SectionShell>
  );
}
