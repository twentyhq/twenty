import { msg } from '@lingui/core/macro';

export const AFFILIATE_APPLICATION_COPY = {
  fields: {
    name: msg`Full name`,
    email: msg`Email`,
    partnerType: msg`Partner type`,
    partnerTypePlaceholder: msg`Select a partner type`,
    mainChannel: msg`Main channel (URL)`,
    mainChannelPlaceholder: msg`https://`,
    audienceSize: msg`Audience size or clients`,
    audienceSizePlaceholder: msg`12k newsletter subscribers`,
    country: msg`Country`,
    promotionPlan: msg`How you plan to promote Twenty`,
    promotionPlanPlaceholder: msg`Reviews, tutorials, migration guides, client recommendations…`,
    isIntegrationPartner: msg`I'm already a Twenty integration partner`,
    acceptsTerms: msg`I agree to the affiliate program terms sent with my referral link`,
  },
  errors: {
    name: msg`Please enter your full name.`,
    email: msg`Please enter a valid email address.`,
    partnerType: msg`Please select a partner type.`,
    mainChannel: msg`Main channel must be a full URL starting with https://`,
    audienceSize: msg`Audience size must be 200 characters or fewer.`,
    country: msg`Country must be 100 characters or fewer.`,
    promotionPlan: msg`How you plan to promote Twenty must be 2,000 characters or fewer.`,
    acceptsTerms: msg`Please agree to the program terms.`,
    unexpected: msg`Something went wrong. Please try again.`,
  },
  submit: msg`Submit application`,
  submitting: msg`Submitting…`,
  successHeading: msg`Application received`,
} as const;
