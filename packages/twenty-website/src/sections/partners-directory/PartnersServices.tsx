import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { mediaUp, radius, semanticColor, spacing } from '@/tokens';
import {
  Body,
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { SERVICE_MODEL_SETTINGS } from './service-model-settings';

const List = styled.ul`
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  padding: 0;

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('lg')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

// The home cards' recipe (ThreeCards): the object on a stage at the top,
// the text under it; outlined like the partner cards below on white.
const Item = styled.li`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(4)};
  padding: ${spacing(4)};
`;

const Stage = styled.div`
  height: 240px;
  overflow: hidden;
  width: 100%;
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

type PartnerServiceKind = {
  title: MessageDescriptor;
  body: MessageDescriptor;
  model: 'spaceship' | 'single-screen' | 'lock' | 'target';
};

const SERVICES: readonly PartnerServiceKind[] = [
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

export function PartnersServices() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Services`)}</Eyebrow>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`What a Twenty partner does`)}
          </Heading>
          <Body muted size="md">
            {i18n._(
              msg`Four kinds of work, delivered by teams that build on Twenty every day.`,
            )}
          </Body>
        </SectionIntro>
        <List>
          {SERVICES.map((service) => (
            <Item key={service.title.id}>
              <Stage aria-hidden>
                <HalftoneModel
                  modelUrl={`/models/${service.model}.glb`}
                  settings={SERVICE_MODEL_SETTINGS}
                />
              </Stage>
              <Text>
                <Heading as="h3" family="sans" size="xs" weight="medium">
                  {i18n._(service.title)}
                </Heading>
                <Body muted size="sm">
                  {i18n._(service.body)}
                </Body>
              </Text>
            </Item>
          ))}
        </List>
      </SectionStack>
    </SectionShell>
  );
}
