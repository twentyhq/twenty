import { msg } from '@lingui/core/macro';

import {
  BecomePartnerButton,
  PartnerApplicationModalRoot,
} from '@/partner-application';
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
import { BecomePartnerFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { PartnerHero } from '@/sections/partner-hero';
import {
  INTEGRATOR_STEPS,
  PartnerLevels,
  ProgramExplainer,
  ProgramStrip,
} from '@/sections/partner-programs';
import { PartnerTestimonials } from '@/sections/testimonials';
import { Button } from '@/ui';

export const generateMetadata = buildRouteMetadata('partnersIntegrators');

const HOW_IT_WORKS_ANCHOR_ID = 'how-it-works';

export default async function IntegratorProgramPage({
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
    <PartnerApplicationModalRoot>
      <JsonLd
        data={buildBreadcrumbListJsonLd(
          [
            { name: 'Home', path: '/' },
            { name: 'Partners', path: '/partners' },
            { name: 'Integrators', path: '/partners/integrators' },
          ],
          locale,
        )}
      />
      <Menu communityStats={communityStats} />
      <main>
        <PartnerHero
          heading={msg`Become a\n*Twenty integrator*`}
          body={msg`You implement Twenty for your clients. Earn 20% on every client you bring, every month for a year.`}
          actions={
            <>
              <BecomePartnerButton label={msg`Apply as an integrator`} />
              <Button
                href={`#${HOW_IT_WORKS_ANCHOR_ID}`}
                label={i18n._(msg`How it works`)}
                variant="outlined"
              />
            </>
          }
        />
        <PartnerLevels />
        <PartnerTestimonials />
        <ProgramExplainer
          anchorId={HOW_IT_WORKS_ANCHOR_ID}
          eyebrow={msg`How it works`}
          heading={msg`From application *to clients*`}
          body={msg`Four steps, and no fee to join. You set your own rates and keep what you bill.`}
          steps={INTEGRATOR_STEPS}
        />
        <ProgramStrip
          heading={msg`You create content, *not implementations?*`}
          body={msg`Creators, communities and tech partners earn 20% on every team they bring to Twenty.`}
          action={
            <Button
              href="/partners/creators"
              label={i18n._(msg`See the creator program`)}
              variant="outlined"
            />
          }
        />
        <BecomePartnerFaq />
        <ProgramStrip
          heading={msg`Ready to *apply?*`}
          body={msg`It takes a few minutes. We review every application by hand.`}
          action={
            <BecomePartnerButton
              label={msg`Apply as an integrator`}
              variant="outlined"
            />
          }
        />
      </main>
    </PartnerApplicationModalRoot>
  );
}
