import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
import { Body, Heading } from '@/ui';

import { PARTNER_LEVELS } from './partner-levels.data';

const PERK_ICON_SIZE_PX = 18;

// A block, not a section: it closes the step list it is slotted under.
const LevelBlock = styled.div`
  padding-top: ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

// Mirrors pricing-plans/PlanCard and PlanFeatureList: sections may not import each other.
const LevelGrid = styled.div`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const LevelCard = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  padding: ${spacing(4)};

  &[data-highlighted] {
    border-color: ${color('blue')};
  }
`;

const LevelLabel = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const LevelHeader = styled.div`
  margin-top: ${spacing(2)};

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const HeadlineLine = styled.div`
  align-items: baseline;
  column-gap: ${spacing(1)};
  display: flex;
  flex-wrap: wrap;
  margin-top: ${spacing(6)};
`;

const LevelRule = styled.div`
  border-top: 1px dotted ${semanticColor.divider};
  margin-top: ${spacing(6)};
`;

const PerksIntro = styled.div`
  margin-block: ${spacing(4)};
`;

const PerkList = styled.ul`
  flex: 1;
  list-style: none;
  padding: 0;

  & > * + * {
    margin-top: ${spacing(4)};
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

const PerkText = styled.span`
  display: flex;
  flex-direction: column;
  gap: ${spacing(0.5)};
  min-width: 0;
`;

const PerkDescription = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.3;
`;

const LevelFooter = styled.div`
  margin-top: ${spacing(4)};

  > * {
    width: 100%;
  }
`;

const Requirement = styled.p`
  align-items: center;
  border: 1px dashed ${semanticColor.lineStrong};
  border-radius: ${radius(2)};
  color: ${semanticColor.inkMuted};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  justify-content: center;
  line-height: 1.3;
  min-height: ${spacing(10)};
  padding: ${spacing(2)} ${spacing(4)};
  text-align: center;
`;

type PartnerLevelsProps = {
  action: ReactNode;
};

export function PartnerLevels({ action }: PartnerLevelsProps) {
  const i18n = getServerI18n();

  return (
    <LevelBlock>
      <Heading as="h3" size="sm" weight="light">
        {i18n._(msg`Start as an integrator, *grow into a lead*`)}
      </Heading>
      <LevelGrid>
        {PARTNER_LEVELS.map((level) => (
          <LevelCard
            data-highlighted={isDefined(level.requirement) ? undefined : ''}
            key={level.title.id}
          >
            <LevelLabel>{i18n._(level.label)}</LevelLabel>
            <LevelHeader>
              <Heading as="h4" family="sans" size="xs" weight="medium">
                {i18n._(level.title)}
              </Heading>
              <Body muted size="sm" weight="medium">
                {i18n._(level.tagline)}
              </Body>
            </LevelHeader>
            <HeadlineLine>
              <Heading as="h5" family="sans" size="sm" weight="medium">
                {i18n._(level.headline)}
              </Heading>
              {isDefined(level.headlineSuffix) && (
                <Body as="span" muted size="sm">
                  {i18n._(level.headlineSuffix)}
                </Body>
              )}
            </HeadlineLine>
            <LevelRule />
            <PerksIntro>
              <Body muted size="sm">
                {i18n._(level.perksIntro)}
              </Body>
            </PerksIntro>
            <PerkList>
              {level.perks.map((perk) => {
                const PerkIcon = perk.icon;

                return (
                  <PerkRow key={perk.title.id}>
                    <PerkIconFrame>
                      <PerkIcon aria-hidden size={PERK_ICON_SIZE_PX} />
                    </PerkIconFrame>
                    <PerkText>
                      <Body as="span" size="sm">
                        {i18n._(perk.title)}
                      </Body>
                      <PerkDescription>
                        {i18n._(perk.description)}
                      </PerkDescription>
                    </PerkText>
                  </PerkRow>
                );
              })}
            </PerkList>
            <LevelFooter>
              {isDefined(level.requirement) ? (
                <Requirement>{i18n._(level.requirement)}</Requirement>
              ) : (
                action
              )}
            </LevelFooter>
          </LevelCard>
        ))}
      </LevelGrid>
    </LevelBlock>
  );
}
