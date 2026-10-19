export const UPSTREAM_SPAM_VERDICT_HEADERS: Record<string, string[]> = {
  'x-forefront-antispam-report': ['sfv:spm', 'sfv:sks'],
  'x-spam-flag': ['yes'],
  'x-spam': ['yes'],
};
