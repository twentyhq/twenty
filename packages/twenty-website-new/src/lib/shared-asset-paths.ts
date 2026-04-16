export const SHARED_COMPANY_LOGO_URLS = {
  a16z: '/images/shared/companies/logos/a16z.png',
  accel: '/images/shared/companies/logos/accel.png',
  airbnb: '/images/shared/companies/logos/airbnb.png',
  airtable: '/images/shared/companies/logos/airtable.png',
  anthropic: '/images/shared/companies/logos/anthropic.png',
  apple: '/images/shared/companies/logos/apple.png',
  apple1977: '/images/shared/companies/logos/apple-1977.png',
  calendar: '/images/shared/companies/logos/calendar.png',
  claude: '/images/shared/companies/logos/claude.png',
  cursor: '/images/shared/companies/logos/cursor.png',
  docusign: '/images/shared/companies/logos/docusign.png',
  figma: '/images/shared/companies/logos/figma.png',
  foundersFund: '/images/shared/companies/logos/founders-fund.png',
  github: '/images/shared/companies/logos/github.png',
  gmail: '/images/shared/companies/logos/gmail.png',
  google: '/images/shared/companies/logos/google.png',
  hubspot: '/images/shared/companies/logos/hubspot.png',
  kleinerPerkins: '/images/shared/companies/logos/kleiner-perkins.png',
  lemlist: '/images/shared/companies/logos/lemlist.png',
  linear: '/images/shared/companies/logos/linear.svg',
  linkedin: '/images/shared/companies/logos/linkedin.png',
  mailchimp: '/images/shared/companies/logos/mailchimp.png',
  meet: '/images/shared/companies/logos/meet.png',
  metabase: '/images/shared/companies/logos/metabase.png',
  microsoft: '/images/shared/companies/logos/microsoft.png',
  notion: '/images/shared/companies/logos/notion.png',
  okta: '/images/shared/companies/logos/okta.png',
  openai: '/images/shared/companies/logos/openai.png',
  outlook: '/images/shared/companies/logos/outlook.png',
  outreach: '/images/shared/companies/logos/outreach.png',
  postgresql: '/images/shared/companies/logos/postgresql.png',
  qonto: '/images/shared/companies/logos/qonto.png',
  salesforce: '/images/shared/companies/logos/salesforce.png',
  segment: '/images/shared/companies/logos/segment.png',
  sequoia: '/images/shared/companies/logos/sequoia.png',
  slack: '/images/shared/companies/logos/slack.png',
  stripe: '/images/shared/companies/logos/stripe.png',
  tally: '/images/shared/companies/logos/tally.png',
  twenty: '/images/shared/companies/logos/twenty.png',
  whatsapp: '/images/shared/companies/logos/whatsapp.png',
  zapier: '/images/shared/companies/logos/zapier.png',
} as const;

export const SHARED_PEOPLE_AVATAR_URLS = {
  alexandreProt: '/images/shared/people/avatars/alexandre-prot.jpg',
  anonymousAnna: '/images/shared/people/avatars/anonymous-anna.jpg',
  anonymousFabrice: '/images/shared/people/avatars/anonymous-fabrice.jpg',
  anonymousFelix: '/images/shared/people/avatars/anonymous-felix.jpg',
  anonymousIndira: '/images/shared/people/avatars/anonymous-indira.jpg',
  anonymousLaura: '/images/shared/people/avatars/anonymous-laura.jpg',
  anonymousMike: '/images/shared/people/avatars/anonymous-mike.jpg',
  anonymousThomas: '/images/shared/people/avatars/anonymous-thomas.jpg',
  benChestnut: '/images/shared/people/avatars/ben-chestnut.jpg',
  brianChesky: '/images/shared/people/avatars/brian-chesky.jpg',
  chrisWanstrath: '/images/shared/people/avatars/chris-wanstrath.jpg',
  craigFederighi: '/images/shared/people/avatars/craig-federighi.jpg',
  darioAmodei: '/images/shared/people/avatars/dario-amodei.jpg',
  dylanField: '/images/shared/people/avatars/dylan-field.jpg',
  eddyCue: '/images/shared/people/avatars/eddy-cue.jpg',
  ivanZhao: '/images/shared/people/avatars/ivan-zhao.jpg',
  jeffWilliams: '/images/shared/people/avatars/jeff-williams.jpg',
  joeGebbia: '/images/shared/people/avatars/joe-gebbia.jpg',
  katherineAdams: '/images/shared/people/avatars/katherine-adams.jpg',
  patrickCollison: '/images/shared/people/avatars/patrick-collison.jpg',
  pingLi: '/images/shared/people/avatars/ping-li.jpg',
  peterReinhardt: '/images/shared/people/avatars/peter-reinhardt.jpg',
  peterThiel: '/images/shared/people/avatars/peter-thiel.jpg',
  philSchiller: '/images/shared/people/avatars/phil-schiller.jpg',
  rayDamm: '/images/shared/people/avatars/ray-damm.jpg',
  reidHoffman: '/images/shared/people/avatars/reid-hoffman.jpg',
  roelofBotha: '/images/shared/people/avatars/roelof-botha.jpg',
  ryanRoslansky: '/images/shared/people/avatars/ryan-roslansky.jpg',
  steveAnavi: '/images/shared/people/avatars/steve-anavi.jpg',
  stewartButterfield:
    '/images/shared/people/avatars/stewart-butterfield.jpg',
  sundarPichai: '/images/shared/people/avatars/sundar-pichai.jpg',
  thomasDohmke: '/images/shared/people/avatars/thomas-dohmke.jpg',
  timCook: '/images/shared/people/avatars/tim-cook.jpg',
} as const;

export const SHARED_COMPANY_LOGO_URLS_BY_DOMAIN = {
  'accel.com': SHARED_COMPANY_LOGO_URLS.accel,
  'airbnb.com': SHARED_COMPANY_LOGO_URLS.airbnb,
  'anthropic.com': SHARED_COMPANY_LOGO_URLS.anthropic,
  'apple.com': SHARED_COMPANY_LOGO_URLS.apple,
  'figma.com': SHARED_COMPANY_LOGO_URLS.figma,
  'foundersfund.com': SHARED_COMPANY_LOGO_URLS.foundersFund,
  'github.com': SHARED_COMPANY_LOGO_URLS.github,
  'google.com': SHARED_COMPANY_LOGO_URLS.google,
  'linkedin.com': SHARED_COMPANY_LOGO_URLS.linkedin,
  'mailchimp.com': SHARED_COMPANY_LOGO_URLS.mailchimp,
  'notion.com': SHARED_COMPANY_LOGO_URLS.notion,
  'qonto.com': SHARED_COMPANY_LOGO_URLS.qonto,
  'segment.com': SHARED_COMPANY_LOGO_URLS.segment,
  'sequoia.com': SHARED_COMPANY_LOGO_URLS.sequoia,
  'slack.com': SHARED_COMPANY_LOGO_URLS.slack,
  'stripe.com': SHARED_COMPANY_LOGO_URLS.stripe,
} as const;

export function getSharedCompanyLogoUrlFromDomainName(domainName?: string) {
  if (!domainName) {
    return undefined;
  }

  const sanitizedDomain = domainName
    .replace(/(https?:\/\/)|(www\.)/g, '')
    .replace(/\/.*$/, '')
    .toLowerCase();

  return SHARED_COMPANY_LOGO_URLS_BY_DOMAIN[
    sanitizedDomain as keyof typeof SHARED_COMPANY_LOGO_URLS_BY_DOMAIN
  ];
}
