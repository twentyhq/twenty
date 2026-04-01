import { registerEnumType } from '@nestjs/graphql';

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  REFERRAL = 'REFERRAL',
  COLD_OUTBOUND = 'COLD_OUTBOUND',
  WARM_OUTBOUND = 'WARM_OUTBOUND',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  EVENT = 'EVENT',
  PARTNER = 'PARTNER',
  ADVERTISING = 'ADVERTISING',
  OTHER = 'OTHER',
}

registerEnumType(LeadSource, {
  name: 'LeadSource',
  description: 'Source of the lead/opportunity',
});
