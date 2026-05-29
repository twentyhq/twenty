import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { styled } from '@linaria/react';

import { getPartnerBySlug } from '@/lib/partners-api';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { theme } from '@/theme';

import {
  BackToMarketplaceLink,
  PartnerFactsList,
  PartnerProfileCtas,
  PartnerProfileHeader,
  PartnerProfileIntro,
  PartnerProfilePhoto,
  PartnerRatesPanel,
} from './components';

// ─── Styled layout ────────────────────────────────────────────────────────────

const PageRoot = styled.div`
  background-color: ${theme.colors.primary.background[100]};
  min-height: 100vh;
`;

const PageInner = styled.div`
  margin: 0 auto;
  max-width: 1100px;
  padding: ${theme.spacing(10)} ${theme.spacing(4)} ${theme.spacing(28)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const ContentGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};

  @media (min-width: ${theme.breakpoints.md}px) {
    display: grid;
    gap: ${theme.spacing(0)};
    grid-template-columns: 7fr 1fr 4fr;
  }
`;

// Left main column
const MainColumn = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(14)};
    grid-column: 1;
  }
`;

// Empty gutter column (only in grid)
const GutterColumn = styled.div`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
    grid-column: 2;
  }
`;

// Right rail column
const RailColumn = styled.aside`
  animation: nameEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) 100ms both;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(6)};

  @keyframes nameEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 12px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-column: 3;
  }
`;

// Skills section within main column
const SkillsSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
`;

const SectionEyebrow = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
`;

const SkillsRow = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const SkillChip = styled.li`
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  padding: ${theme.spacing(1.5)} ${theme.spacing(3)};
`;

const Divider = styled.hr`
  background-color: ${theme.colors.primary.border[10]};
  border: none;
  height: 1px;
  margin: 0;
`;

const WhereSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
`;

// ─── Metadata ─────────────────────────────────────────────────────────────────

type PartnerProfilePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

const truncateDescription = (text: string, max = 160) => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
};

export async function generateMetadata({
  params,
}: PartnerProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);
  if (!partner) {
    return { title: 'Partner not found · Twenty Partners' };
  }
  return {
    title: `${partner.name} · Twenty Partners`,
    description: truncateDescription(partner.introduction),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PartnerProfilePage({
  params,
}: PartnerProfilePageProps) {
  const { locale, slug } = await params;
  const [partner, stats] = await Promise.all([
    getPartnerBySlug(slug),
    fetchCommunityStats(),
  ]);
  if (!partner) {
    notFound();
  }

  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.primary.background[100]}
        scheme="primary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="primary" />
        <Menu.Nav scheme="primary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="primary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="primary" />
      </Menu.Root>

      <PageRoot>
        <PageInner>
          <ContentGrid>
            {/* ── Left main column ── */}
            <MainColumn aria-labelledby="partner-name">
              <BackToMarketplaceLink locale={locale} />

              <PartnerProfileHeader partner={partner} />

              <PartnerProfileIntro introduction={partner.introduction} />

              {partner.skills.length > 0 && (
                <SkillsSection>
                  <SectionEyebrow>What they do</SectionEyebrow>
                  <SkillsRow aria-label="Skills">
                    {partner.skills.map((skill) => (
                      <SkillChip key={skill}>{skill}</SkillChip>
                    ))}
                  </SkillsRow>
                </SkillsSection>
              )}

              <Divider aria-hidden="true" />

              <WhereSection>
                <SectionEyebrow>Where &amp; how</SectionEyebrow>
                <PartnerFactsList
                  region={partner.region}
                  languagesSpoken={partner.languagesSpoken}
                  deploymentExpertise={partner.deploymentExpertise}
                />
              </WhereSection>
            </MainColumn>

            {/* ── Gutter (desktop only) ── */}
            <GutterColumn />

            {/* ── Right rail ── */}
            <RailColumn aria-label="Partner facts and contact">
              <PartnerProfilePhoto
                name={partner.name}
                slug={partner.slug}
                profilePictureUrl={partner.profilePictureUrl}
              />
              <PartnerRatesPanel
                hourlyRateUsd={partner.hourlyRateUsd}
                projectBudgetMinUsd={partner.projectBudgetMinUsd}
                projectBudgetTypicalUsd={partner.projectBudgetTypicalUsd}
              />
              <PartnerProfileCtas
                calendarLink={partner.calendarLink}
                linkedinUrl={partner.linkedinUrl}
              />
            </RailColumn>
          </ContentGrid>
        </PageInner>
      </PageRoot>
    </>
  );
}
