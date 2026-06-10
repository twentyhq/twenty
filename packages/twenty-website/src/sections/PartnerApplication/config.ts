// Cal.com path (no host) the partner application success screen books the intro
// call onto. Overridable via env so the org / self-hosters can point it at a
// team link without a code change; defaults to the canonical handle.
// Full link: https://cal.com/<this-value>
export const PARTNER_INTRO_CAL_LINK =
  process.env.NEXT_PUBLIC_PARTNER_INTRO_CAL_LINK ||
  'rashad-twenty/partner-intro';
