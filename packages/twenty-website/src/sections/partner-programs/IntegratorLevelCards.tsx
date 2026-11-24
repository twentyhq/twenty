import { msg } from '@lingui/core/macro';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';

import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import {
  buildSchemeDeclarations,
  color,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import {
  Body,
  Eyebrow,
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

// The /pricing plan cards (PlanCard): white on the grey section, each level
// marked by its own object in the header's top-right corner. The top level is
// a dark scheme island (HelpedCard's pattern): text, divider and muted ink
// resolve from the scheme, not from per-element overrides.
const Item = styled.li`
  background-color: ${color('white')};
  border: 1px solid transparent;
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  display: flex;
  flex-direction: column;
  padding: ${spacing(4)};

  & > * + * {
    margin-top: ${spacing(4)};
  }

  &[data-scheme='dark'] {
    ${buildSchemeDeclarations('dark')}
    background-color: ${color('black')};
  }
`;

const ICON_SIZE_PX = 80;

// As tall as the object, so the rule below always clears it.
const Header = styled.div`
  min-height: ${ICON_SIZE_PX}px;
  padding-right: calc(${ICON_SIZE_PX}px + ${spacing(3)});
  position: relative;
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const Icon = styled.div`
  border-radius: ${radius(2)};
  height: ${ICON_SIZE_PX}px;
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 0;
  width: ${ICON_SIZE_PX}px;
`;

// PlanCard's CardRule.
const Rule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  height: 0;
  width: 100%;

  && {
    margin-top: ${spacing(6)};
  }
`;

// PlanFeatureList's measures: intro in black-70, 16px between rows, an 18px
// blue icon in a 28px column, 12px from the text.
const FEATURE_ITEM_SPACING = spacing(4);
const FEATURE_ICON_SIZE_PX = 18;

const perksIntroClassName = css`
  color: ${color('black-70')};
  margin-bottom: ${FEATURE_ITEM_SPACING};

  [data-scheme='dark'] & {
    color: ${color('white-70')};
  }
`;

const Perks = styled.ul`
  list-style: none;
  padding: 0;

  & > li + li {
    margin-top: ${FEATURE_ITEM_SPACING};
  }
`;

const PerkRow = styled.li`
  align-items: start;
  column-gap: ${spacing(3)};
  display: grid;
  grid-template-columns: ${spacing(7)} minmax(0, 1fr);
`;

const PerkIconFrame = styled.span`
  align-items: center;
  color: ${color('blue')};
  display: flex;
  height: calc(${fontSize(4)} * 1.55);
  justify-content: center;
`;

// PlanCard's CtaRow: full-width action, pushed to the card's foot so both
// cards end on the same line.
const Action = styled.div`
  && {
    margin-top: auto;
    padding-top: ${spacing(4)};
  }

  > * {
    display: flex;
    width: 100%;
  }
`;

type IntegratorLevelCardsProps = {
  levels: readonly IntegratorLevel[];
};

export function IntegratorLevelCards({ levels }: IntegratorLevelCardsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="muted">
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
            const isTopLevel = index === levels.length - 1;

            return (
              <Item
                data-scheme={isTopLevel ? 'dark' : undefined}
                key={level.title.id}
              >
                <Header>
                  <Text>
                    <Heading as="h3" family="sans" size="xs" weight="medium">
                      {i18n._(level.title)}
                    </Heading>
                    <Body muted size="sm">
                      {i18n._(level.tagline)}
                    </Body>
                  </Text>
                  {isDefined(levelModel) && (
                    <Icon
                      aria-hidden
                      data-model-slot={`integrator-level-${index + 1}`}
                    >
                      <HalftoneModel
                        modelUrl={levelModel.modelUrl}
                        settings={levelModel.settings}
                      />
                    </Icon>
                  )}
                </Header>
                <Rule />
                <div>
                  <Body as="p" className={perksIntroClassName} size="sm">
                    {i18n._(level.perksIntro)}
                  </Body>
                  <Perks>
                    {level.perks.map((perk) => {
                      const PerkIcon = perk.icon;

                      return (
                        <PerkRow key={perk.title.id}>
                          <PerkIconFrame>
                            <PerkIcon aria-hidden size={FEATURE_ICON_SIZE_PX} />
                          </PerkIconFrame>
                          <Body as="span" size="sm">
                            {i18n._(perk.title)}
                          </Body>
                        </PerkRow>
                      );
                    })}
                  </Perks>
                </div>
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
