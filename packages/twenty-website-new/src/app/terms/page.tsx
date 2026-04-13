import type { Metadata } from 'next';

import { MENU_DATA } from '@/app/_constants';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { LegalDocumentPage } from '@/sections/LegalDocument/legal-document-page';

import { TermsDocument } from './_components';

export const metadata: Metadata = {
  title: 'Terms of Service — Twenty',
  description:
    'Terms of Service for Twenty.com PBC, including use of Twenty.com, sub-domains, and related services.',
};

export default async function TermsPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(MENU_DATA.socialLinks, stats);

  return (
    <LegalDocumentPage
      menuData={{ navItems: MENU_DATA.navItems, socialLinks: menuSocialLinks }}
      title="Terms of Service"
    >
      <TermsDocument />
    </LegalDocumentPage>
  );
}
