import { isNonEmptyString } from '@sniptt/guards';

import { type RunAgentMessage } from '@/application/runAgentType';
import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

export const hasRunAgentMessageContentOrAttachments = ({
  content,
  attachments,
}: Pick<RunAgentMessage, 'content' | 'attachments'>): boolean =>
  isNonEmptyString(content.trim()) || isNonEmptyArray(attachments);
