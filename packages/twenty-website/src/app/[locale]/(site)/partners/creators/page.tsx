import { msg } from '@lingui/core/macro';

import { AffiliateApplicationModalRoot } from '@/affiliate-application';
import { TalkToUsButton } from '@/contact-cal';
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
import { AffiliateProgramFaq } from '@/sections/faq';
import { Menu } from '@/sections/menu';
import { ProductStepper } from '@/sections/product-stepper';
import {
  CREATOR_STEPPER_STEPS,
  CreatorApplyButton,
  CreatorAudiences,
  CreatorHeroRoom,
  CreatorHeroScene,
  ProgramHero,
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
      <Menu communityStats={communityStats} scheme="muted" />
      <main>
        <ProgramHero
          actions={
            <>
              <CreatorApplyButton />
              <Button
                href={`#${HOW_IT_WORKS_ANCHOR_ID}`}
                label={i18n._(msg`How it works`)}
                variant="outlined"
              />
            </>
          }
          backdrop={<CreatorHeroScene />}
          visual={<CreatorHeroRoom />}
          body={msg`Create content or run a community. Earn 20% on every team you bring to Twenty, every month for a year.`}
          heading={msg`Become a\n*Twenty creator*`}
        />
        <CreatorAudiences />
        <ProductStepper
          anchorId={HOW_IT_WORKS_ANCHOR_ID}
          body={msg`Share your link, we credit the signups it brings, and you get paid every month the customer stays, for up to 12 months.`}
          eyebrow={msg`How it works`}
          heading={msg`From link *to payout*`}
          steps={CREATOR_STEPPER_STEPS}
        />
        <AffiliateProgramFaq
          actions={
            <>
              <CreatorApplyButton />
              <TalkToUsButton label={msg`Talk to us`} variant="outlined" />
            </>
          }
        />
      </main>
    </AffiliateApplicationModalRoot>
  );
}
