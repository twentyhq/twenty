import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Body, Heading, SectionShell } from '@/ui';

import { type IntegratorLevel } from './integrator-level.type';
import { IntegratorReveal } from './IntegratorReveal';

const PERK_ICON_SIZE_PX = 18;

const Layout = styled.div`
  & > * + * {
    margin-top: ${spacing(10)};
  }
`;

const HeadingMeasure = styled.div`
  max-width: 640px;
`;

const rowsClassName = `integrator-levels-rows`;

const Rows = styled.div`
  .${rowsClassName} > * + * {
    margin-top: ${spacing(3)};
  }
`;

// Full-width rows, not a comparison table: level one is open and filled,
// level two is earned and stays an outline.
const LevelRow = styled.article`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
  padding: ${spacing(6)};
  position: relative;
  gap: ${spacing(8)} 0;

  &[data-open] {
    background-color: ${color('black')};
  }

  & > * {
    position: relative;
  }

  ${mediaUp('md')} {
    column-gap: ${spacing(16)};
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    padding: ${spacing(10)};
  }
`;

const Identity = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  & > * + * {
    margin-top: ${spacing(10)};
  }
`;

const IdentityTop = styled.div`
  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const LevelLabel = styled.p`
  align-items: center;
  color: ${semanticColor.inkMuted};
  column-gap: ${spacing(3)};
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

// Two dashes: how far up the ladder this level sits.
const TitleBlock = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Headline = styled.p`
  align-items: baseline;
  color: ${semanticColor.ink};
  column-gap: ${spacing(3)};
  display: flex;
  flex-wrap: wrap;
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(14)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.03em;
  line-height: 1;

  &[data-figure] {
    font-size: ${fontSize(24)};
  }

  ${mediaUp('md')} {
    font-size: ${fontSize(18)};

    &[data-figure] {
      font-size: ${fontSize(36)};
    }
  }
`;

const HeadlineSuffix = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const Offer = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const PerkList = styled.ul`
  flex: 1;
  list-style: none;
  padding: 0;
`;

const PerkRow = styled.li`
  align-items: start;
  border-top: 1px solid ${semanticColor.line};
  column-gap: ${spacing(4)};
  display: grid;
  grid-template-columns: ${PERK_ICON_SIZE_PX}px minmax(0, 1fr);
  padding-block: ${spacing(4)};
  transition: padding-left ${DURATION.md} ${EASING.standard};

  &:last-child {
    border-bottom: 1px solid ${semanticColor.line};
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const PerkIconFrame = styled.span`
  align-items: center;
  color: ${color('blue')};
  display: flex;
  height: calc(${fontSize(4)} * 1.55);

  [data-open] & {
    color: ${color('green')};
  }
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

const ActionRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)} ${spacing(4)};
`;

const ActionNote = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: 11px;
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const Requirement = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.3;
`;

type IntegratorLevelsProps = {
  anchorId: string;
  heading: MessageDescriptor;
  levels: readonly IntegratorLevel[];
  action: ReactNode;
  actionNote: string;
};

// PROTOTYPE direction d: the two levels as a ladder, apply on the first rung.
export function IntegratorLevels({
  anchorId,
  heading,
  levels,
  action,
  actionNote,
}: IntegratorLevelsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="dark">
      <Layout id={anchorId}>
        <HeadingMeasure>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(heading)}
          </Heading>
        </HeadingMeasure>
        <Rows>
          <IntegratorReveal className={rowsClassName}>
            {levels.map((level) => {
              const isOpen = !isDefined(level.requirement);

              return (
                <LevelRow
                  data-open={isOpen ? '' : undefined}
                  key={level.title.id}
                >
                  <Identity>
                    <IdentityTop>
                      <LevelLabel>{i18n._(level.label)}</LevelLabel>
                      <TitleBlock>
                        <Heading
                          as="h3"
                          family="sans"
                          size="sm"
                          weight="regular"
                        >
                          {i18n._(level.title)}
                        </Heading>
                        <Body muted size="sm">
                          {i18n._(level.tagline)}
                        </Body>
                      </TitleBlock>
                    </IdentityTop>
                    <Headline
                      data-figure={
                        isDefined(level.headlineSuffix) ? '' : undefined
                      }
                    >
                      {i18n._(level.headline)}
                      {isDefined(level.headlineSuffix) && (
                        <HeadlineSuffix>
                          {i18n._(level.headlineSuffix)}
                        </HeadlineSuffix>
                      )}
                    </Headline>
                  </Identity>
                  <Offer>
                    <Body muted size="sm">
                      {i18n._(level.perksIntro)}
                    </Body>
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
                    {isDefined(level.requirement) ? (
                      <Requirement>{i18n._(level.requirement)}</Requirement>
                    ) : (
                      <ActionRow>
                        {action}
                        <ActionNote>{actionNote}</ActionNote>
                      </ActionRow>
                    )}
                  </Offer>
                </LevelRow>
              );
            })}
          </IntegratorReveal>
        </Rows>
      </Layout>
    </SectionShell>
  );
}
