import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import { mediaUp, radius, semanticColor, spacing } from '@/tokens';
import {
  Body,
  Eyebrow,
  Field,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { type IntegratorLevel } from './integrator-level.type';
import { INTEGRATOR_LEVEL_MODELS } from './integrator-level-models';
import { IntegratorApplyButton } from './IntegratorApplyButton';

const List = styled.ul`
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  padding: 0;

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

// The /partners Services cards: the object on a stage, the text under it.
const Item = styled.li`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  padding: ${spacing(6)};
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

const Perks = styled.ul`
  list-style: none;
  padding: 0;

  & > li {
    align-items: center;
    color: ${semanticColor.ink};
    display: flex;
    gap: ${spacing(3)};
    padding-block: ${spacing(1.5)};
  }

  & > li > svg {
    flex-shrink: 0;
  }
`;

const Action = styled.div`
  margin-top: auto;
`;

type IntegratorLevelCardsProps = {
  levels: readonly IntegratorLevel[];
};

export function IntegratorLevelCards({ levels }: IntegratorLevelCardsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`Levels`)}</Eyebrow>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`Start as an integrator, *grow into a lead*`)}
          </Heading>
          <Body muted size="md">
            {i18n._(
              msg`Every partner starts as an integrator. We invite the most experienced to become leads.`,
            )}
          </Body>
        </SectionIntro>
        <List>
          {levels.map((level, index) => {
            const levelModel = INTEGRATOR_LEVEL_MODELS[index];

            return (
              <Item key={level.title.id}>
                {isDefined(levelModel) && (
                  <Stage
                    aria-hidden
                    data-model-slot={`integrator-level-${index + 1}`}
                  >
                    <HalftoneModel
                      modelUrl={levelModel.modelUrl}
                      settings={levelModel.settings}
                    />
                  </Stage>
                )}
                <Text>
                  <Heading as="h3" family="sans" size="xs" weight="medium">
                    {i18n._(level.title)}
                  </Heading>
                  <Body muted size="sm">
                    {i18n._(level.tagline)}
                  </Body>
                </Text>
                <Field label={i18n._(level.perksIntro)}>
                  <Perks>
                    {level.perks.map((perk) => {
                      const PerkIcon = perk.icon;

                      return (
                        <li key={perk.title.id}>
                          <PerkIcon aria-hidden size={16} />
                          <Body size="sm">{i18n._(perk.title)}</Body>
                        </li>
                      );
                    })}
                  </Perks>
                </Field>
                <Action>
                  {isDefined(level.requirement) ? (
                    <Body muted size="sm">
                      {i18n._(level.requirement)}
                    </Body>
                  ) : (
                    <IntegratorApplyButton />
                  )}
                </Action>
              </Item>
            );
          })}
        </List>
      </SectionStack>
    </SectionShell>
  );
}
