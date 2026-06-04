import { buildRouteMetadata } from '@/lib/seo';
import { getRouteI18n, type LocaleRouteParams } from '@/lib/i18n/server';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { Menu, MENU_DATA } from '@/sections/Menu';
import { theme } from '@/theme';
import { PartnerApplicationPageContent } from './PartnerApplicationPageContent';

export const generateMetadata = buildRouteMetadata('partnersApply');

type ApplyPageProps = {
  params: Promise<LocaleRouteParams>;
};

export default async function PartnerApplyPage({ params }: ApplyPageProps) {
  const [, stats] = await Promise.all([
    getRouteI18n(params),
    fetchCommunityStats(),
  ]);
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <>
      <Menu
        backgroundColor={theme.colors.primary.background[100]}
        socialLinks={menuSocialLinks}
      />
      <PartnerApplicationPageContent />
    </>
  );
}
