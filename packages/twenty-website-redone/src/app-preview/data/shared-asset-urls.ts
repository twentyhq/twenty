// The mockup's people avatars and company logos (referenced-only copies of
// the old site's shared assets). One pile, one import path.
const PEOPLE_AVATARS: Record<string, string> = {
  anonymousIndira: '/images/shared/people/avatars/anonymous-indira.webp',
  anonymousLaura: '/images/shared/people/avatars/anonymous-laura.webp',
  benChestnut: '/images/shared/people/avatars/ben-chestnut.webp',
  brianChesky: '/images/shared/people/avatars/brian-chesky.webp',
  chrisWanstrath: '/images/shared/people/avatars/chris-wanstrath.webp',
  darioAmodei: '/images/shared/people/avatars/dario-amodei.webp',
  dylanField: '/images/shared/people/avatars/dylan-field.webp',
  ivanZhao: '/images/shared/people/avatars/ivan-zhao.webp',
  joeGebbia: '/images/shared/people/avatars/joe-gebbia.webp',
  anonymousMike: '/images/shared/people/avatars/anonymous-mike.webp',
  patrickCollison: '/images/shared/people/avatars/patrick-collison.webp',
  pingLi: '/images/shared/people/avatars/ping-li.webp',
  reidHoffman: '/images/shared/people/avatars/reid-hoffman.webp',
  roelofBotha: '/images/shared/people/avatars/roelof-botha.webp',
  ryanRoslansky: '/images/shared/people/avatars/ryan-roslansky.webp',
  stewartButterfield: '/images/shared/people/avatars/stewart-butterfield.webp',
  sundarPichai: '/images/shared/people/avatars/sundar-pichai.webp',
  thomasDohmke: '/images/shared/people/avatars/thomas-dohmke.webp',
};

const COMPANY_LOGOS_BY_DOMAIN: Record<string, string> = {
  'accel.com': '/images/shared/companies/logos/accel.webp',
  'airbnb.com': '/images/shared/companies/logos/airbnb.webp',
  'google.com': '/images/shared/companies/logos/google.webp',
  'cursor.com': '/images/shared/companies/logos/cursor.webp',
  'linear.app': '/images/shared/companies/logos/linear.svg',
  'sequoia.com': '/images/shared/companies/logos/sequoia.webp',
  'sequoiacap.com': '/images/shared/companies/logos/sequoia.webp',
  'twenty.com': '/images/shared/companies/logos/twenty.webp',
  'anthropic.com': '/images/shared/companies/logos/anthropic.webp',
  'figma.com': '/images/shared/companies/logos/figma.webp',
  'github.com': '/images/shared/companies/logos/github.webp',
  'linkedin.com': '/images/shared/companies/logos/linkedin.webp',
  'mailchimp.com': '/images/shared/companies/logos/mailchimp.webp',
  'notion.com': '/images/shared/companies/logos/notion.webp',
  'slack.com': '/images/shared/companies/logos/slack.webp',
  'stripe.com': '/images/shared/companies/logos/stripe.webp',
};

export const sharedAssetUrls = {
  peopleAvatars: PEOPLE_AVATARS,
  companyLogoForDomain: (domainName?: string): string | undefined => {
    if (!domainName) {
      return undefined;
    }
    const sanitizedDomain = domainName
      .replace(/(https?:\/\/)|(www\.)/g, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
    return COMPANY_LOGOS_BY_DOMAIN[sanitizedDomain];
  },
};
