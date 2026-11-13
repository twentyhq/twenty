import { msg } from '@lingui/core/macro';

import {
  AffiliateApplicationModalRoot,
  AffiliateApplyButton,
} from '@/affiliate-application';
import { getCommunityStats } from '@/platform/community';
import {
  getRouteI18n,
  type LocaleRouteParams,
} from '@/platform/i18n/get-route-i18n';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { resolveLocaleParam } from '@/platform/i18n/resolve-locale-param';
import {
  buildBreadcrumbListJsonLd,
  buildRouteMetadata,
  JsonLd,
} from '@/platform/seo';
import { AffiliateAudiences } from '@/sections/affiliate-program';
import { AffiliateProgramFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PartnerHero } from '@/sections/partner-hero';
import {
  CREATOR_STEPS,
  ProgramExplainer,
  ProgramStrip,
} from '@/sections/partner-programs';
import { Button } from '@/ui';

export const generateMetadata = buildRouteMetadata('partnersCreators');

const HOW_IT_WORKS_ANCHOR_ID = 'how-it-works';

export default async function CreatorProgramPage({
  params,
}: {
  params: Promise<LocaleRouteParams>;
}) {
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const i18n = getServerI18n();
  const locale = resolveLocaleParam((await params).locale);

  return (
    <AffiliateApplicationModalRoot>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
            { name: 'Creators', path: '/partners/creators' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <PartnerHero
          heading={msg`Become a\n*Twenty creator*`}
          body={msg`You create content or run a community. Earn 20% on every team you bring to Twenty, every month for a year.`}
          actions={
            <>
              <AffiliateApplyButton label={msg`Apply as a creator`} />
              <Button
                href={`#${HOW_IT_WORKS_ANCHOR_ID}`}
                label={i18n._(msg`How it works`)}
                variant="outlined"
              />
            </>
          }
        />
        <AffiliateAudiences />
        <ProgramExplainer
          anchorId={HOW_IT_WORKS_ANCHOR_ID}
          eyebrow={msg`How it works`}
          heading={msg`From link *to payout*`}
          body={msg`Share your link, we credit the signups it brings, and you get paid every month the customer stays.`}
          steps={CREATOR_STEPS}
        />
        <ProgramStrip
          heading={msg`You implement Twenty *for clients?*`}
          body={msg`Integrators earn 20% on the clients they bring, and Lead Integrators also get client briefs.`}
          action={
            <Button
              href="/partners/integrators"
              label={i18n._(msg`See the integrator program`)}
              variant="outlined"
            />
          }
        />
        <AffiliateProgramFaq />
        <ProgramStrip
          heading={msg`Ready to *apply?*`}
          body={msg`We review every application within 5 business days and send your link once you're approved.`}
          action={
            <AffiliateApplyButton
              label={msg`Apply as a creator`}
              variant="outlined"
            />
          }
        />
      </main>
    </AffiliateApplicationModalRoot>
  );
}
