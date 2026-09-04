import crypto from 'node:crypto';
export function generateGravatarUrl(email: string, defaultAvatar = "mp"): string {
  const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=${defaultAvatar}`;
}