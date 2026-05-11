import { getCaseStudyPalette, type CaseStudyData } from '@/lib/customers';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudy } from '@/sections/CaseStudy';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { theme } from '@/theme';

import { CustomersCaseStudySignoff } from './CustomersCaseStudySignoff';

type CaseStudyPageLayoutProps = {
  caseStudy: CaseStudyData;
  path: string;
};

export async function CaseStudyPageLayout({
  caseStudy,
  path,
}: CaseStudyPageLayoutProps) {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const palette = getCaseStudyPalette(path);

  let storySectionIndex = 0;
  const sectionBlocks = caseStudy.sections.map((block, index) => {
    if (block.type === 'text') {
      const sectionId = `case-study-section-${storySectionIndex}`;
      storySectionIndex += 1;
      return (
        <CaseStudy.TextBlock
          key={index}
          block={block}
          isLast={index === caseStudy.sections.length - 1}
          sectionId={sectionId}
        />
      );
    }
    return (
      <CaseStudy.VisualBlock
        key={index}
        block={block}
        isLast={index === caseStudy.sections.length - 1}
      />
    );
  });

  return (
    <>
      <Menu.Root
        backgroundColor={theme.colors.secondary.background[100]}
        scheme="secondary"
        navItems={MENU_DATA.navItems}
        socialLinks={menuSocialLinks}
      >
        <Menu.Logo scheme="secondary" />
        <Menu.Nav scheme="secondary" navItems={MENU_DATA.navItems} />
        <Menu.Social scheme="secondary" socialLinks={menuSocialLinks} />
        <Menu.Cta scheme="secondary" />
      </Menu.Root>

      <CaseStudy.Hero
        dashColor={palette.dashColor}
        hero={caseStudy.hero}
        hoverDashColor={palette.hoverDashColor}
      />

      <CaseStudy.Highlights
        industry={caseStudy.hero.industry}
        kpis={caseStudy.hero.kpis}
      />

      <CaseStudy.Body>{sectionBlocks}</CaseStudy.Body>

      <CaseStudy.SectionNav items={caseStudy.tableOfContents} />
      <CustomersCaseStudySignoff />
    </>
  );
}
