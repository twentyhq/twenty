import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  GRADIENT,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { GuideCrosshair, SectionShell } from '@/ui';

import { BackToMarketplaceLink } from './BackToMarketplaceLink';
import { type MarketplacePartner } from './marketplace-partner';
import { PartnerFactsList } from './PartnerFactsList';
import { PartnerProfileCtas } from './PartnerProfileCtas';
import { PartnerProfileHeader } from './PartnerProfileHeader';
import { PartnerProfileIntro } from './PartnerProfileIntro';
import { PartnerProfilePhoto } from './PartnerProfilePhoto';
import { PartnerRatesPanel } from './PartnerRatesPanel';
import { ProfileEyebrow } from './ProfileEyebrow';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// A detail page reads tighter than the full 1440 grid — capped like a measure.
const ProfileInner = styled.div`
  margin-inline: auto;
  max-width: 1100px;
  width: 100%;
`;

const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(10)};

  ${mediaUp('md')} {
    display: grid;
    gap: 0;
    grid-template-columns: 7fr 1fr 4fr;
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    grid-column: 1;

    & > * + * {
      margin-top: ${spacing(14)};
    }
  }
`;

const GutterColumn = styled.div`
  display: none;

  ${mediaUp('md')} {
    display: block;
    grid-column: 2;
  }
`;

// The decision rail: a soft neutral panel grouping photo + CTAs + rates, lifted
// gently off the wash without a hard card.
const RailColumn = styled.aside`
  align-self: flex-start;
  animation: profileRailEnter 700ms ${EASING.standard} 100ms both;
  background-color: ${color('black-5')};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(6)};
  padding: ${spacing(6)};
  position: relative;

  @keyframes profileRailEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 12px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }

  ${mediaUp('md')} {
    grid-column: 3;
  }
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const SkillsRow = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  list-style: none;
  padding: 0;
`;

const SkillChip = styled.li`
  background-color: ${color('blue-5')};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.medium};
  padding: ${spacing(2)} ${spacing(4)};
`;

const Divider = styled.hr`
  background-color: ${semanticColor.line};
  border: none;
  height: 1px;
`;

export function PartnerProfile({ partner }: { partner: MarketplacePartner }) {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<GradientBackdrop />}
      rhythm="section"
      scheme="muted"
    >
      <ProfileInner>
        <ContentGrid>
          <MainColumn>
            <BackToMarketplaceLink />
            <PartnerProfileHeader partner={partner} />
            <PartnerProfileIntro introduction={partner.introduction} />
            {partner.skills.length > 0 && (
              <Block>
                <ProfileEyebrow>{i18n._(msg`What they do`)}</ProfileEyebrow>
                <SkillsRow aria-label={i18n._(msg`Skills`)}>
                  {partner.skills.map((skill) => (
                    <SkillChip key={skill}>{skill}</SkillChip>
                  ))}
                </SkillsRow>
              </Block>
            )}
            <Divider aria-hidden="true" />
            <Block>
              <ProfileEyebrow>{i18n._(msg`Where & how`)}</ProfileEyebrow>
              <PartnerFactsList
                region={partner.region}
                languagesSpoken={partner.languagesSpoken}
                partnerScope={partner.partnerScope}
              />
            </Block>
          </MainColumn>
          <GutterColumn />
          <RailColumn aria-label={i18n._(msg`Partner facts and contact`)}>
            <GuideCrosshair
              crossX={`calc(100% - ${spacing(3)})`}
              crossY={spacing(3)}
            />
            <PartnerProfilePhoto
              name={partner.name}
              slug={partner.slug}
              profilePictureUrl={partner.profilePictureUrl}
            />
            <PartnerProfileCtas
              calendarLink={partner.calendarLink}
              linkedinUrl={partner.linkedinUrl}
              partnerName={partner.name}
            />
            <PartnerRatesPanel
              hourlyRateUsd={partner.hourlyRateUsd}
              projectBudgetMinUsd={partner.projectBudgetMinUsd}
              projectBudgetTypicalUsd={partner.projectBudgetTypicalUsd}
            />
          </RailColumn>
        </ContentGrid>
      </ProfileInner>
    </SectionShell>
  );
}
