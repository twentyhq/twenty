import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { styled } from '@linaria/react';

import { Container } from '@/design-system/components';
import { getPartnerBySlug } from '@/lib/partners-api';
import { PartnerChipRow } from '@/app/[locale]/partners/list/components/PartnerChipRow';
import {
  DEPLOYMENT_EXPERTISE_LABELS,
  SERVED_GEO_LABELS,
  SPOKEN_LANGUAGE_LABELS,
} from '@/app/[locale]/partners/list/components/chip-labels';
import { msg } from '@lingui/core/macro';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { theme } from '@/theme';

import {
  PartnerProfileHeader,
  PartnerProfileIntro,
  PartnerRatesPanel,
  PartnerProfileCtas,
} from './components';

const Page = styled.main`
  background-color: ${theme.colors.primary.background[100]};
  min-height: 100vh;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  padding-bottom: ${theme.spacing(28)};
  padding-top: ${theme.spacing(10)};
`;

const ChipRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
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
  background-color: ${theme.colors.primary.text[5]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: 999px;
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  padding: ${theme.spacing(1.5)} ${theme.spacing(3)};
`;

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

export default async function PartnerProfilePage({
  params,
}: PartnerProfilePageProps) {
  const { slug } = await params;
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

      <Page>
        <Container>
          <Stack>
            <PartnerProfileHeader partner={partner} />
            <PartnerProfileIntro introduction={partner.introduction} />
            <PartnerRatesPanel
              hourlyRateUsd={partner.hourlyRateUsd}
              projectBudgetMinUsd={partner.projectBudgetMinUsd}
              projectBudgetTypicalUsd={partner.projectBudgetTypicalUsd}
            />
            <ChipRows>
              <PartnerChipRow
                label={msg`Regions`}
                values={partner.region}
                valueLabels={SERVED_GEO_LABELS}
              />
              <PartnerChipRow
                label={msg`Languages`}
                values={partner.languagesSpoken}
                valueLabels={SPOKEN_LANGUAGE_LABELS}
              />
              <PartnerChipRow
                label={msg`Deploys`}
                values={partner.deploymentExpertise}
                valueLabels={DEPLOYMENT_EXPERTISE_LABELS}
              />
            </ChipRows>
            {partner.skills.length > 0 && (
              <SkillsRow aria-label="Skills">
                {partner.skills.map((skill) => (
                  <SkillChip key={skill}>{skill}</SkillChip>
                ))}
              </SkillsRow>
            )}
            <PartnerProfileCtas
              calendarLink={partner.calendarLink}
              linkedinUrl={partner.linkedinUrl}
            />
          </Stack>
        </Container>
      </Page>
    </>
  );
}
