import { msg } from '@lingui/core/macro';

import { AffiliateApplicationModalRoot } from '@/affiliate-application';
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
import {
  CREATOR_STEPS,
  CREATOR_DOCK_MODEL,
  CreatorApplyButton,
  CreatorAudiences,
  CreatorTermsCard,
  ProgramApplyDock,
  ProgramHero,
  ProgramHeroBackdrop,
  ProgramPath,
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
      <Menu communityStats={communityStats} scheme="dark" />
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
          backdrop={
            <ProgramHeroBackdrop
              imageUrl="/images/partners/hero/creators-hero.webp"
              isFaint
            />
          }
          body={msg`Create content or run a community. Earn 20% on every team you bring to Twenty, every month for a year.`}
          eyebrow={msg`Partners`}
          heading={msg`Become a\n*Twenty creator*`}
        />
        <CreatorTermsCard />
        <CreatorAudiences />
        <ProgramPath
          anchorId={HOW_IT_WORKS_ANCHOR_ID}
          body={msg`Share your link, we credit the signups it brings, and you get paid every month the customer stays, for up to 12 months.`}
          eyebrow={msg`How it works`}
          heading={msg`From link *to payout*`}
          steps={CREATOR_STEPS}
        />
        <AffiliateProgramFaq />
      </main>
      <ProgramApplyDock
        action={<CreatorApplyButton isDocked />}
        model={CREATOR_DOCK_MODEL}
      />
    </AffiliateApplicationModalRoot>
  );
}
