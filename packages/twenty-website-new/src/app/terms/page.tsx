import { MENU_DATA } from '@/app/_constants';
import { fetchCommunityStats } from '@/lib/community/fetch-community-stats';
import { mergeSocialLinkLabels } from '@/lib/community/merge-social-link-labels';
import { LegalDocumentPage } from '@/sections/LegalDocument/legal-document-page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions — Twenty',
  description: 'Terms governing your use of Twenty products and services.',
};

export default async function TermsPage() {
  const stats = await fetchCommunityStats();
  const menuSocialLinks = mergeSocialLinkLabels(
    MENU_DATA.socialLinks,
    stats,
  );

  return (
    <LegalDocumentPage
      menuData={{ navItems: MENU_DATA.navItems, socialLinks: menuSocialLinks }}
      title="Terms and Conditions"
    >
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
        odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla
        quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent
        mauris.
      </p>
      <h2>Acceptance of terms</h2>
      <p>
        Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum
        lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent
        per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in
        libero. Sed dignissim lacinia nunc.
      </p>
      <p>
        Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at
        dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel
        nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis,
        luctus non, massa.
      </p>
      <h2>Use of the service</h2>
      <p>
        Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus
        metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque
        volutpat condimentum velit. Class aptent taciti sociosqu ad litora
        torquent per conubia nostra, per inceptos himenaeos.
      </p>
      <p>
        Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque
        adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut
        fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat
        imperdiet. Vestibulum sapien. Proin quam.
      </p>
      <h2>Limitation of liability</h2>
      <p>
        Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed
        lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae
        pharetra auctor, sem massa mattis sem, at interdum magna augue eget
        diam.
      </p>
      <p>
        Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
        cubilia curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed
        non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit
        amet pede facilisis laoreet.
      </p>
    </LegalDocumentPage>
  );
}
