import type { FirewallFieldPermissionEntry } from 'src/modules/executive-search/firewall/firewall-registry.types';

/**
 * Maps each firewall-prohibited selector to its object/field universal
 * identifiers for field-level permission enforcement.
 */
export const FIREWALL_PROHIBITED_FIELD_PERMISSIONS: FirewallFieldPermissionEntry[] = [
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'subscriptionTier',
    selector: 'subscription_tier',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'planLevel',
    selector: 'plan_level',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'isPremium',
    selector: 'is_premium',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveSettings',
    fieldUniversalIdentifier: 'stripeCustomerId',
    selector: 'stripe_customer_id',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'purchasePaymentHistory',
    selector: 'purchase_payment_history',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'marketingOptIn',
    selector: 'marketing_opt_in',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'learningActivity',
    selector: 'learning_activity',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'courseCompletion',
    selector: 'course_completion',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'quizActivity',
    selector: 'quiz_activity',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'contentConsumption',
    selector: 'content_consumption',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'profileViews',
    selector: 'profile_views',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'marketingEngagement',
    selector: 'marketing_engagement',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'candidateServiceUsageFrequency',
    selector: 'candidate_service_usage_frequency',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executivePsychographic',
    fieldUniversalIdentifier: 'executivePsychographic',
    selector: 'executive_psychographic',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'profileAnalyses',
    fieldUniversalIdentifier: 'photoAnalysisScores',
    selector: 'photo_analysis_scores',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'birthdate',
    selector: 'birthdate',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'executiveProfile',
    fieldUniversalIdentifier: 'gender',
    selector: 'gender',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'candidateDemographicsVoluntary',
    fieldUniversalIdentifier: 'voluntaryDemographics',
    selector: 'voluntary_demographics',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'accommodationRequests',
    fieldUniversalIdentifier: 'accommodationMedicalInfo',
    selector: 'accommodation_medical_info',
    canReadFieldValue: false,
  },
  {
    objectUniversalIdentifier: 'aiApplicationAnalysis',
    fieldUniversalIdentifier: 'unreviewedCultureFitScore',
    selector: 'unreviewed_culture_fit_score',
    canReadFieldValue: false,
  },
];
