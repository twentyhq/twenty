import { type OnboardingEmailDigestRecentSubject } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-recent-subject.type';
import { type OnboardingEmailDigestSyncState } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-sync-state.type';
import { type OnboardingEmailDigestTopCompanyDomain } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-top-company-domain.type';
import { type OnboardingEmailDigestTopContact } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-top-contact.type';

export type OnboardingEmailDigest =
  | { syncState: 'NOT_CONNECTED' }
  | {
      syncState: Exclude<OnboardingEmailDigestSyncState, 'NOT_CONNECTED'>;
      connectedAccountHandle: string;
      importedMessageCount: number;
      topContacts: OnboardingEmailDigestTopContact[];
      topCompanyDomains: OnboardingEmailDigestTopCompanyDomain[];
      recentSubjects: OnboardingEmailDigestRecentSubject[];
    };
