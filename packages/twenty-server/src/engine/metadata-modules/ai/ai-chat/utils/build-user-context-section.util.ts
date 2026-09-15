import { isNonEmptyString } from '@sniptt/guards';
import { getValidTimeZoneOrUndefined } from 'twenty-shared/utils';

import { type UserContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';

const formatCurrentDate = (timezone: string | null): string =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: getValidTimeZoneOrUndefined(timezone),
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

export const buildUserContextSection = (userContext: UserContext): string => {
  const parts = [
    `User: ${userContext.firstName} ${userContext.lastName}`.trim(),
  ];

  if (isNonEmptyString(userContext.jobTitle)) {
    parts.push(`Job title: ${userContext.jobTitle}`);
  }

  parts.push(`Locale: ${userContext.locale}`);

  const resolvedTimeZone = getValidTimeZoneOrUndefined(userContext.timezone);

  if (resolvedTimeZone) {
    parts.push(`Timezone: ${resolvedTimeZone}`);
  }

  parts.push(`Current date: ${formatCurrentDate(userContext.timezone)}`);

  return `
## User Context

${parts.join('\n')}`;
};
