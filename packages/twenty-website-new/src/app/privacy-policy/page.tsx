import type { Metadata } from 'next';

import { MENU_DATA } from '@/app/_constants';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { LegalDocumentPage } from '@/sections/LegalDocument/legal-document-page';

import { PrivacyPolicyDocument } from './_components';

export const metadata: Metadata = {
  title: 'Privacy Policy — Twenty',
  description:
    'How Twenty collects, uses, safeguards, and discloses information when you use Twenty.com and related services.',
};

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
