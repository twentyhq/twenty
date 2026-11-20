import { msg } from '@lingui/core/macro';

import { DiscordMark } from '@/icons';
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
import { buildFaqPageJsonLd } from '@/platform/seo/build-faq-page-json-ld';
import { BecomePartnerFaq } from '@/sections/faq';
import { BECOME_PARTNER_FAQ_QUESTIONS } from '@/sections/faq/become-partner-faq.data';
import { FaqItems } from '@/sections/faq/FaqItems';
// PROTOTYPE direction d (?direction=d): the staged integrator page.
import {
  IntegratorApplyButton,
  IntegratorApplyDock,
  IntegratorClosing,
  IntegratorFaq,
  IntegratorHero,
  IntegratorLevelCards,
  IntegratorLevels,
  IntegratorPath,
  IntegratorQuotes,
} from '@/sections/integrator-stage';
import { Menu } from '@/sections/menu';
import { INTEGRATOR_HERO_STATS, PartnerHero } from '@/sections/partner-hero';
import {
  INTEGRATOR_STEPS,
  PartnerLevels,
  ProgramExplainer,
} from '@/sections/partner-programs';
import { PARTNER_LEVELS } from '@/sections/partner-programs/partner-levels.data';
import { PartnerTestimonials } from '@/sections/testimonials';
import { PARTNER_TESTIMONIALS } from '@/sections/testimonials/partner-testimonials.data';
import { Button } from '@/ui';

export const generateMetadata = buildRouteMetadata('partnersIntegrators');

const HOW_IT_WORKS_ANCHOR_ID = 'how-it-works';
const LEVELS_ANCHOR_ID = 'levels';

export default async function IntegratorProgramPage({
  params,
  searchParams,
}: {
  params: Promise<LocaleRouteParams>;
  searchParams: Promise<{ direction?: string }>;
}) {
  const isDirectionD = ((await searchParams).direction ?? 'd') === 'd';
  const [, communityStats] = await Promise.all([
    getRouteI18n(params),
    getCommunityStats(),
  ]);
  const i18n = getServerI18n();
  const locale = resolveLocaleParam((await params).locale);

  const breadcrumbJsonLd = (
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
  );

  // PROTOTYPE direction d.
  if (isDirectionD) {
    const [, , freeToJoin] = INTEGRATOR_HERO_STATS;

    return (
      <PartnerApplicationModalRoot>
        {breadcrumbJsonLd}
        <Menu communityStats={communityStats} scheme="dark" />
        <main>
          <IntegratorHero
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
            eyebrow={msg`Partners`}
            body={msg`Implement Twenty for your clients. Earn 20% on every client you bring, every month for a year.`}
            heading={msg`Become a\n*Twenty integrator*`}
          />
          <IntegratorLevelCards
            ledgerFootnote={msg`Commission on Organization and Enterprise plans`}
            levels={PARTNER_LEVELS}
          />
          <IntegratorPath
            anchorId={HOW_IT_WORKS_ANCHOR_ID}
            body={msg`Three steps, and no fee to join. You set your own rates and keep what you bill.`}
            eyebrow={msg`How it works`}
            heading={msg`From application *to clients*`}
            help={{
              title: msg`Get help anytime`,
              body: msg`Ask our team and partners on the partner Discord.`,
              marker: <DiscordMark size={16} />,
            }}
            steps={INTEGRATOR_STEPS}
          />
          <IntegratorQuotes quotes={PARTNER_TESTIMONIALS} />
          <IntegratorLevels
            anchorId={LEVELS_ANCHOR_ID}
            action={<IntegratorApplyButton />}
            actionNote={`${i18n._(freeToJoin.value)} ${i18n._(freeToJoin.label)}`}
            heading={msg`Start as an integrator, *grow into a lead*`}
            levels={PARTNER_LEVELS}
          />
          <IntegratorClosing
            heading={msg`Apply as an integrator`}
            notes={[
              msg`Applying and joining are free`,
              msg`We review every application by hand`,
              msg`It takes a few minutes`,
            ]}
          />
          <JsonLd
            data={buildFaqPageJsonLd(i18n, BECOME_PARTNER_FAQ_QUESTIONS)}
          />
          <IntegratorFaq
            eyebrow={msg`Questions`}
            heading={msg`Becoming *a Twenty integrator*`}
          >
            <FaqItems questions={BECOME_PARTNER_FAQ_QUESTIONS} />
          </IntegratorFaq>
        </main>
        <IntegratorApplyDock />
      </PartnerApplicationModalRoot>
    );
  }

  return (
    <PartnerApplicationModalRoot>
      {breadcrumbJsonLd}
      <Menu communityStats={communityStats} />
      <main>
        <PartnerHero
          badge={msg`Beta`}
          heading={msg`Become a\n*Twenty integrator*`}
          body={msg`Implement Twenty for your clients. Earn 20% on every client you bring, every month for a year.`}
          stats={INTEGRATOR_HERO_STATS}
          statsNote={msg`Commission on Organization and Enterprise plans`}
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
        <ProgramExplainer
          anchorId={HOW_IT_WORKS_ANCHOR_ID}
          eyebrow={msg`How it works`}
          heading={msg`From application *to clients*`}
          body={msg`Three steps, and no fee to join. You set your own rates and keep what you bill.`}
          steps={INTEGRATOR_STEPS}
          closingRow={{
            title: msg`Get help anytime`,
            body: msg`Ask our team and partners on the partner Discord.`,
            marker: <DiscordMark size={16} />,
          }}
          footer={[
            {
              id: 'levels',
              node: (
                <PartnerLevels
                  action={
                    <BecomePartnerButton label={msg`Apply as an integrator`} />
                  }
                />
              ),
            },
          ]}
        />
        <PartnerTestimonials />
        <BecomePartnerFaq />
      </main>
    </PartnerApplicationModalRoot>
  );
}
