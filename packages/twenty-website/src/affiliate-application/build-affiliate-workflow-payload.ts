import { type AffiliateApplicationRequest } from './affiliate-application-request-schema';
import { type AffiliatePartnerTypeValue } from './data/affiliate-partner-type-options';

// Mirrors the expectedBody of the "Affiliate form: create affiliate
// application" workflow in the partners workspace. Every key is always sent:
// a workflow variable pointing at a missing key would not resolve.
export type AffiliateApplicationWorkflowPayload = {
  name: string;
  email: string;
  partnerType: AffiliatePartnerTypeValue;
  mainChannelUrl: string;
  audienceSize: string;
  country: string;
  promotionPlan: string;
  isIntegrationPartner: boolean;
};

export function buildAffiliateWorkflowPayload(
  request: AffiliateApplicationRequest,
): AffiliateApplicationWorkflowPayload {
  return {
    name: request.name,
    // Lowercased so the workflow can match the applicant to an existing person.
    email: request.email.toLowerCase(),
    partnerType: request.partnerType,
    mainChannelUrl: request.mainChannel ?? '',
    audienceSize: request.audienceSize ?? '',
    country: request.country ?? '',
    promotionPlan: request.promotionPlan ?? '',
    isIntegrationPartner: request.isIntegrationPartner === true,
  };
}
