// The Cal.com path (no host) and namespace the success screen books the partner
// intro call onto. The namespace scopes the embed's ui() config to this booking
// only. A fixed link — this is the brand site, so there is no self-hoster
// override (the old site's env knob does not apply here).
export const PARTNER_INTRO_CAL: { link: string; namespace: string } = {
  link: 'rashad-twenty/partner-intro',
  namespace: 'partner-intro',
};
