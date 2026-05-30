import { getCaseStudyPalette, type CaseStudyData } from '@/lib/customers';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import {
  CaseStudyBody,
  CaseStudyHero,
  CaseStudyHighlights,
  CaseStudySectionNav,
  CaseStudyTextBlock,
  CaseStudyVisualBlock,
} from '@/sections/CaseStudy';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { theme } from '@/theme';

import { CustomersCaseStudySignoff } from './CustomersCaseStudySignoff';

type CustomersCaseStudyPageLayoutProps = {
  caseStudy: CaseStudyData;
  path: string;
};

export async function CustomersCaseStudyPageLayout({
  caseStudy,
  path,
}: CustomersCaseStudyPageLayoutProps) {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);
  const palette = getCaseStudyPalette(path);

  let storySectionIndex = 0;
  const sectionBlocks = caseStudy.sections.map((block, index) => {
    if (block.type === 'text') {
      const sectionId = `case-study-section-${storySectionIndex}`;
      storySectionIndex += 1;
      return (
        <CaseStudyTextBlock
          key={index}
          block={block}
          isLast={index === caseStudy.sections.length - 1}
          sectionId={sectionId}
        />
      );
    }
    return (
      <CaseStudyVisualBlock
        key={index}
        block={block}
        isLast={index === caseStudy.sections.length - 1}
      />
    );
  });

  return (
    <>
      <Menu
        backgroundColor={theme.colors.secondary.background[100]}
        scheme="secondary"
        socialLinks={menuSocialLinks}
      />

      <CaseStudyHero
        dashColor={palette.dashColor}
        hero={caseStudy.hero}
        hoverDashColor={palette.hoverDashColor}
      />

      <CaseStudyHighlights
        industry={caseStudy.hero.industry}
        kpis={caseStudy.hero.kpis}
      />

      <CaseStudyBody>{sectionBlocks}</CaseStudyBody>

      <CaseStudySectionNav items={caseStudy.tableOfContents} />
      <CustomersCaseStudySignoff />
    </>
  );
}
