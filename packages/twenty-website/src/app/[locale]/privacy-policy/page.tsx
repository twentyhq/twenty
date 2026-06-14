import { MENU_DATA } from '@/sections/Menu';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { LegalDocumentPage } from '@/sections/LegalDocument';
import { buildRouteMetadata } from '@/lib/seo';

import { PrivacyPolicyDocument } from './_components';

export const generateMetadata = buildRouteMetadata('privacyPolicy');

export default async function PrivacyPolicyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <LegalDocumentPage
      menuData={{ navItems: MENU_DATA.navItems, socialLinks: menuSocialLinks }}
      title="Privacy Policy"
    >
      <PrivacyPolicyDocument />
    </LegalDocumentPage>
  );
}
