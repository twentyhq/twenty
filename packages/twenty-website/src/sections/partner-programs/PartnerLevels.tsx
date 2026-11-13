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
import {
  Body,
  Eyebrow,
  Heading,
  SectionIntro,
  SectionShell,
  SectionStack,
} from '@/ui';

import { PARTNER_LEVELS } from './partner-levels.data';

const HeadingMeasure = styled.div`
  ${mediaUp('md')} {
    max-width: 640px;
  }
`;

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
  padding: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const LevelMarker = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  display: block;
  height: 7px;
  width: 14px;
`;

const LevelTitle = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.01em;
  line-height: 1.3;
`;

const PerkList = styled.ul`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.6;
  margin: ${spacing(4)} 0 0;
  padding-left: ${spacing(4.5)};
`;

export function PartnerLevels() {
  const i18n = getServerI18n();

  return (
    <SectionShell rhythm="section" scheme="light">
      <SectionStack>
        <SectionIntro>
          <Eyebrow>{i18n._(msg`How it works`)}</Eyebrow>
          <HeadingMeasure>
            <Heading as="h2" size="lg" weight="light">
              {i18n._(msg`Start as an integrator, *grow into a lead*`)}
            </Heading>
          </HeadingMeasure>
        </SectionIntro>
        <LevelGrid>
          {PARTNER_LEVELS.map((level) => (
            <LevelCard key={level.title.id}>
              <LevelMarker aria-hidden />
              <LevelTitle>{i18n._(level.title)}</LevelTitle>
              <Body muted size="sm">
                {i18n._(level.body)}
              </Body>
              <PerkList>
                {level.perks.map((perk) => (
                  <li key={perk.id}>{i18n._(perk)}</li>
                ))}
              </PerkList>
            </LevelCard>
          ))}
        </LevelGrid>
      </SectionStack>
    </SectionShell>
  );
}
