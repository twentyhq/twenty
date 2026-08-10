import { isNonEmptyString } from '@sniptt/guards';

import { ONBOARDING_EMAIL_DIGEST_MAX_RECENT_SUBJECTS } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-max-recent-subjects.constant';
import { ONBOARDING_EMAIL_DIGEST_SUBJECT_MAX_LENGTH } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-subject-max-length.constant';
import { type OnboardingEmailDigestRecentSubject } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-recent-subject.type';
import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

const REPLY_OR_FORWARD_PREFIX_PATTERN = /^(re|fwd?|fw)\s*:\s*/i;

const normalizeSubjectDeduplicationKey = (subject: string): string => {
  let normalizedSubject = subject.trim().toLowerCase();

  while (REPLY_OR_FORWARD_PREFIX_PATTERN.test(normalizedSubject)) {
    normalizedSubject = normalizedSubject.replace(
      REPLY_OR_FORWARD_PREFIX_PATTERN,
      '',
    );
  }

  return normalizedSubject;
};

export const buildOnboardingEmailDigestRecentSubjects = (
  messages: { subject: string | null; receivedAt: Date | null }[],
): OnboardingEmailDigestRecentSubject[] => {
  const seenSubjectKeys = new Set<string>();
  const recentSubjects: OnboardingEmailDigestRecentSubject[] = [];

  for (const message of messages) {
    const sanitizedSubject = sanitizePromptContextLine(
      message.subject,
      ONBOARDING_EMAIL_DIGEST_SUBJECT_MAX_LENGTH,
    );

    if (!isNonEmptyString(sanitizedSubject)) {
      continue;
    }

    // The digest message wraps subjects in double quotes, so a quote inside
    // one would visually break out of its delimiters.
    const subject = sanitizedSubject.replace(/"/g, "'");

    const subjectKey = normalizeSubjectDeduplicationKey(subject);

    if (!isNonEmptyString(subjectKey) || seenSubjectKeys.has(subjectKey)) {
      continue;
    }

    seenSubjectKeys.add(subjectKey);
    recentSubjects.push({
      subject,
      receivedAt:
        message.receivedAt === null
          ? null
          : new Date(message.receivedAt).toISOString().slice(0, 10),
    });

    if (recentSubjects.length >= ONBOARDING_EMAIL_DIGEST_MAX_RECENT_SUBJECTS) {
      break;
    }
  }

  return recentSubjects;
};
