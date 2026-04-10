import { FAQ_DATA, MENU_DATA } from '@/app/_constants';
import { ALL_CASE_STUDIES } from '@/app/case-studies/_constants';
import { Eyebrow, LinkButton } from '@/design-system/components';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { CaseStudy } from '@/sections/CaseStudy/components';
import { Faq } from '@/sections/Faq/components';
import { Menu } from '@/sections/Menu/components';
import { theme } from '@/theme';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return ALL_CASE_STUDIES.map((caseStudy) => ({
    slug: caseStudy.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = ALL_CASE_STUDIES.find((cs) => cs.slug === slug);

  if (!caseStudy) {
    return { title: 'Case Study Not Found — Twenty' };
  }

  return {
    title: caseStudy.meta.title,
    description: caseStudy.meta.description,
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = ALL_CASE_STUDIES.find((cs) => cs.slug === slug);

  if (!caseStudy) {
    notFound();
  }

  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

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

      <CaseStudy.Hero hero={caseStudy.hero} />

      {caseStudy.sections.map((block, index) => {
        if (block.type === 'text') {
          return <CaseStudy.TextBlock key={index} block={block} />;
        }
        return <CaseStudy.VisualBlock key={index} block={block} />;
      })}

      <CaseStudy.Testimonial testimonial={caseStudy.testimonial} />

      <Faq.Root illustration={FAQ_DATA.illustration}>
        <Faq.Intro>
          <Eyebrow colorScheme="secondary" heading={FAQ_DATA.eyebrow.heading} />
          <Faq.Heading segments={FAQ_DATA.heading} />
          <Faq.Cta>
            <LinkButton
              color="primary"
              href="https://app.twenty.com/welcome"
              label="Get started"
              type="anchor"
              variant="contained"
            />
            <LinkButton
              color="primary"
              href="https://twenty.com/contact"
              label="Talk to us"
              type="anchor"
              variant="outlined"
            />
          </Faq.Cta>
        </Faq.Intro>
        <Faq.Items questions={FAQ_DATA.questions} />
      </Faq.Root>

      <CaseStudy.TableOfContents items={caseStudy.tableOfContents} />
    </>
  );
}
