import { isNonEmptyString } from '@sniptt/guards';

import { ONBOARDING_EMAIL_DIGEST_MAX_TOP_COMPANY_DOMAINS } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-max-top-company-domains.constant';
import { type OnboardingEmailDigestParticipantGroupRow } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-participant-group-row.type';
import { type OnboardingEmailDigestTopCompanyDomain } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-top-company-domain.type';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';
import { isWorkDomain } from 'src/utils/is-work-email';

export const buildOnboardingEmailDigestTopCompanyDomains = (
  participantGroupRows: OnboardingEmailDigestParticipantGroupRow[],
  ownHandles: Set<string>,
): OnboardingEmailDigestTopCompanyDomain[] => {
  const ownDomains = new Set(
    [...ownHandles].map(getDomainNameFromHandle).filter(isNonEmptyString),
  );

  const messageCountByDomain = new Map<string, number>();

  for (const row of participantGroupRows) {
    const handle = row.handle?.toLowerCase();

    if (
      !isNonEmptyString(handle) ||
      ownHandles.has(handle) ||
      isGroupEmail(handle)
    ) {
      continue;
    }

    const domain = getDomainNameFromHandle(handle);

    if (
      !isNonEmptyString(domain) ||
      ownDomains.has(domain) ||
      !isWorkDomain(domain)
    ) {
      continue;
    }

    messageCountByDomain.set(
      domain,
      (messageCountByDomain.get(domain) ?? 0) + Number(row.messageCount),
    );
  }

  return [...messageCountByDomain.entries()]
    .sort(
      ([, firstMessageCount], [, secondMessageCount]) =>
        secondMessageCount - firstMessageCount,
    )
    .slice(0, ONBOARDING_EMAIL_DIGEST_MAX_TOP_COMPANY_DOMAINS)
    .map(([domain, messageCount]) => ({ domain, messageCount }));
};
