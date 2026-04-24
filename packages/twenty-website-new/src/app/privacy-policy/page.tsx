import type { Metadata } from 'next';

import { MENU_DATA } from '@/sections/Menu/data';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { LegalDocument } from '@/sections/LegalDocument/components';
import { buildPageMetadata } from '@/lib/seo';

import { PrivacyPolicyDocument } from './_components';

export const metadata: Metadata = buildPageMetadata({
  path: '/privacy-policy',
  title: 'Privacy Policy | Twenty',
  description:
    'How Twenty collects, uses, safeguards, and discloses information when you use Twenty.com and related services.',
});

export default async function PrivacyPolicyPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <LegalDocument.Page
      menuData={{ navItems: MENU_DATA.navItems, socialLinks: menuSocialLinks }}
      title="Privacy Policy"
    >
      <PrivacyPolicyDocument />
    </LegalDocument.Page>
  );
}
