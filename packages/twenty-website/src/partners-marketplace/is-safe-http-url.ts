// Guards CRM/partner-provided URLs before they become an href or img src: only
// http(s) passes, so a javascript:/data: payload can never slip through.
export const isSafeHttpUrl = (raw: string): boolean => {
  try {
    return ['https:', 'http:'].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
};
