import { isNonEmptyString } from '@sniptt/guards';

import { ONBOARDING_EMAIL_DIGEST_DISPLAY_NAME_MAX_LENGTH } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-display-name-max-length.constant';
import { ONBOARDING_EMAIL_DIGEST_HANDLE_MAX_LENGTH } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-handle-max-length.constant';
import { ONBOARDING_EMAIL_DIGEST_MAX_TOP_CONTACTS } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-max-top-contacts.constant';
import { type OnboardingEmailDigestParticipantGroupRow } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-participant-group-row.type';
import { type OnboardingEmailDigestTopContact } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-top-contact.type';
import { isGroupEmail } from 'src/modules/messaging/message-import-manager/utils/is-group-email';
import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

export const buildOnboardingEmailDigestTopContacts = ({
  participantGroupRows,
  ownHandles,
}: {
  participantGroupRows: OnboardingEmailDigestParticipantGroupRow[];
  ownHandles: Set<string>;
}): OnboardingEmailDigestTopContact[] => {
  const topContacts: OnboardingEmailDigestTopContact[] = [];

  for (const row of participantGroupRows) {
    const handle = sanitizePromptContextLine(
      row.handle,
      ONBOARDING_EMAIL_DIGEST_HANDLE_MAX_LENGTH,
    )?.toLowerCase();

    if (
      !isNonEmptyString(handle) ||
      ownHandles.has(handle) ||
      isGroupEmail(handle)
    ) {
      continue;
    }

    topContacts.push({
      handle,
      displayName: sanitizePromptContextLine(
        row.displayName,
        ONBOARDING_EMAIL_DIGEST_DISPLAY_NAME_MAX_LENGTH,
      ),
      messageCount: Number(row.messageCount),
    });

    if (topContacts.length >= ONBOARDING_EMAIL_DIGEST_MAX_TOP_CONTACTS) {
      break;
    }
  }

  return topContacts;
};
