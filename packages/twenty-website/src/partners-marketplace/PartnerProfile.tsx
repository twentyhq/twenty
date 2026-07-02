import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  EASING,
  GRADIENT,
  mediaUp,
  radius,
  REDUCED_MOTION,
  spacing,
} from '@/tokens';
import { GuideCrosshair, SectionShell } from '@/ui';

import { BackToMarketplaceLink } from './BackToMarketplaceLink';
import { type MarketplacePartner } from './marketplace-partner';
import { PartnerCoverageSection } from './PartnerCoverageSection';
import { PartnerProfileCtas } from './PartnerProfileCtas';
import { PartnerProfileHeader } from './PartnerProfileHeader';
import { PartnerProfileAbout } from './PartnerProfileAbout';
import { PartnerProfilePhoto } from './PartnerProfilePhoto';
import { PartnerReachFacts } from './PartnerReachFacts';
import { PartnerSelectedWork } from './PartnerSelectedWork';
import { PartnerServices } from './PartnerServices';
import { PartnerRatesPanel } from './PartnerRatesPanel';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// A detail page reads tighter than the full 1440 grid — capped like a measure.
const ProfileInner = styled.div`
  margin-inline: auto;
  max-width: 1240px;
  width: 100%;
`;

const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(10)};

  ${mediaUp('md')} {
    column-gap: ${spacing(9)};
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(18.5rem, 21rem);
  }

  ${mediaUp('lg')} {
    column-gap: ${spacing(10)};
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(10)};
  min-width: 0;

  ${mediaUp('md')} {
    gap: ${spacing(14)};
    grid-column: 1;
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
  min-width: 0;
  padding: ${spacing(6)};
  position: relative;
  width: 100%;

  ${mediaUp('md')} {
    gap: ${spacing(7.5)};
    padding: ${spacing(7.5)};
  }

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
    grid-column: 2;
    position: sticky;
    top: ${spacing(20)};
  }
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
            <PartnerProfileAbout description={partner.description} />
            <PartnerCoverageSection
              partnerScope={partner.partnerScope}
              skills={partner.skills}
            />
            <PartnerSelectedWork portfolio={partner.portfolio} />
            <PartnerServices services={partner.services} />
          </MainColumn>
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
              links={partner.links}
              linkUrls={partner.linkUrls}
            />
            <PartnerRatesPanel
              hourlyRateUsd={partner.hourlyRateUsd}
              projectBudgetMinUsd={partner.projectBudgetMinUsd}
            />
            <PartnerReachFacts
              languagesSpoken={partner.languagesSpoken}
              region={partner.region}
            />
          </RailColumn>
        </ContentGrid>
      </ProfileInner>
    </SectionShell>
  );
}
