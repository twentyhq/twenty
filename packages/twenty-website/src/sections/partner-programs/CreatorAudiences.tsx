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

import { CREATOR_AUDIENCE_MODEL_SETTINGS } from './creator-audience-model-settings';
import { CREATOR_AUDIENCES } from './creator-audiences.data';

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

// The /partners services recipe (itself the home cards'): the object on a
// stage at the top, the text under it, outlined on white.
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

export function CreatorAudiences() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Who it's for`)}</Eyebrow>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`People that teams trust *to pick their tools*`)}
          </Heading>
          <Body muted size="md">
            {i18n._(
              msg`If teams ask you which software to use, your recommendation can pay.`,
            )}
          </Body>
        </SectionIntro>
        <List>
          {CREATOR_AUDIENCES.map((audience) => (
            <Item key={audience.title.id}>
              <Stage aria-hidden data-model-slot={`creator-${audience.model}`}>
                <HalftoneModel
                  modelUrl={`/models/${audience.model}.glb`}
                  settings={CREATOR_AUDIENCE_MODEL_SETTINGS}
                />
              </Stage>
              <Text>
                <Heading as="h3" family="sans" size="xs" weight="medium">
                  {i18n._(audience.title)}
                </Heading>
                <Body muted size="sm">
                  {i18n._(audience.body)}
                </Body>
              </Text>
            </Item>
          ))}
        </List>
      </SectionStack>
    </SectionShell>
  );
}
