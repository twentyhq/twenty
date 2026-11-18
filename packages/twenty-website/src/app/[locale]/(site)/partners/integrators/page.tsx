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
import { BecomePartnerFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { INTEGRATOR_HERO_STATS, PartnerHero } from '@/sections/partner-hero';
import {
  INTEGRATOR_STEPS,
  PartnerLevels,
  ProgramExplainer,
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
