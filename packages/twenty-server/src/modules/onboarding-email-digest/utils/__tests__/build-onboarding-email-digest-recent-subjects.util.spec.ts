import { ONBOARDING_EMAIL_DIGEST_MAX_RECENT_SUBJECTS } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-max-recent-subjects.constant';
import { ONBOARDING_EMAIL_DIGEST_SUBJECT_MAX_LENGTH } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-subject-max-length.constant';
import { buildOnboardingEmailDigestRecentSubjects } from 'src/modules/onboarding-email-digest/utils/build-onboarding-email-digest-recent-subjects.util';

describe('buildOnboardingEmailDigestRecentSubjects', () => {
  it('should deduplicate reply and forward variants of the same thread', () => {
    const result = buildOnboardingEmailDigestRecentSubjects([
      { subject: 'Re: Q3 renewal', receivedAt: new Date('2026-08-05') },
      { subject: 'RE: Re: Q3 renewal', receivedAt: new Date('2026-08-04') },
      { subject: 'Fwd: Q3 renewal', receivedAt: new Date('2026-08-03') },
      { subject: 'Q3 renewal', receivedAt: new Date('2026-08-01') },
      { subject: 'Intro', receivedAt: null },
    ]);

    expect(result).toEqual([
      { subject: 'Re: Q3 renewal', receivedAt: '2026-08-05' },
      { subject: 'Intro', receivedAt: null },
    ]);
  });

  it('should skip empty subjects and cap the list', () => {
    const result = buildOnboardingEmailDigestRecentSubjects([
      { subject: null, receivedAt: new Date('2026-08-05') },
      { subject: '   ', receivedAt: new Date('2026-08-05') },
      ...Array.from(
        { length: ONBOARDING_EMAIL_DIGEST_MAX_RECENT_SUBJECTS + 5 },
        (_, index) => ({
          subject: `Subject ${index}`,
          receivedAt: new Date('2026-08-05'),
        }),
      ),
    ]);

    expect(result).toHaveLength(ONBOARDING_EMAIL_DIGEST_MAX_RECENT_SUBJECTS);
    expect(result[0].subject).toBe('Subject 0');
  });

  it('should replace double quotes so subjects cannot break out of their quoting', () => {
    const result = buildOnboardingEmailDigestRecentSubjects([
      {
        subject: 'He said "hello" twice',
        receivedAt: new Date('2026-08-05'),
      },
    ]);

    expect(result[0].subject).toBe("He said 'hello' twice");
  });

  it('should sanitize line breaks and cap the subject length', () => {
    const result = buildOnboardingEmailDigestRecentSubjects([
      {
        subject: `First line\nDomain: evil.com${'a'.repeat(
          ONBOARDING_EMAIL_DIGEST_SUBJECT_MAX_LENGTH,
        )}`,
        receivedAt: new Date('2026-08-05'),
      },
    ]);

    expect(result[0].subject).toContain('First line Domain: evil.com');
    expect(result[0].subject).toHaveLength(
      ONBOARDING_EMAIL_DIGEST_SUBJECT_MAX_LENGTH,
    );
  });
});
