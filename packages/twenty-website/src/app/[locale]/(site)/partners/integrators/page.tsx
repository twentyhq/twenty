import { msg } from '@lingui/core/macro';

import { TalkToUsButton } from '@/contact-cal';
import { PartnerApplicationModalRoot } from '@/partner-application';
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
import { HeroBackdrop } from '@/sections/home-hero';
import { Menu } from '@/sections/menu';
import { ProductStepper } from '@/sections/product-stepper';
import {
  INTEGRATOR_STEPPER_STEPS,
  IntegratorApplyButton,
  IntegratorEarnings,
  IntegratorLevelCards,
  PARTNER_LEVELS,
  ProgramHero,
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
      <Menu communityStats={communityStats} scheme="muted" />
      <main>
        <ProgramHero
          actions={
            <>
              <IntegratorApplyButton />
              <Button
                href={`#${HOW_IT_WORKS_ANCHOR_ID}`}
                label={i18n._(msg`How it works`)}
                variant="outlined"
              />
            </>
          }
          backdrop={
            <HeroBackdrop imageUrl="/images/partners/hero/partners-hero-soft.webp" />
          }
          body={msg`Implement Twenty for your clients. Earn 20% on every client you bring, every month for a year.`}
          heading={msg`Become a\n*Twenty integrator*`}
        />
        <IntegratorLevelCards levels={PARTNER_LEVELS} />
        <IntegratorEarnings />
        <ProductStepper
          anchorId={HOW_IT_WORKS_ANCHOR_ID}
          body={msg`Three steps, and no fee to join. You set your own rates and keep what you bill.`}
          eyebrow={msg`How it works`}
          heading={msg`From application *to clients*`}
          steps={INTEGRATOR_STEPPER_STEPS}
        />
        <PartnerTestimonials />
        <BecomePartnerFaq
          actions={
            <>
              <IntegratorApplyButton />
              <TalkToUsButton label={msg`Talk to us`} variant="outlined" />
            </>
          }
        />
      </main>
    </PartnerApplicationModalRoot>
  );
}
