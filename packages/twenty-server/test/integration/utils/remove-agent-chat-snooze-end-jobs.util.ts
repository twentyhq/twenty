import { removeDelayedJobs } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { END_AGENT_CHAT_CHANNEL_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-channel-snooze-job-name.constant';
import { END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/end-agent-chat-thread-snooze-job-name.constant';

const SNOOZE_END_JOB_NAMES = [
  END_AGENT_CHAT_THREAD_SNOOZE_JOB_NAME,
  END_AGENT_CHAT_CHANNEL_SNOOZE_JOB_NAME,
];

// A snooze end reschedules itself until the database clock reaches it, so the
// job drain between tests would otherwise wait out every snooze a test left
export const removeAgentChatSnoozeEndJobs = ({
  threadIds,
}: {
  threadIds: string[];
}) =>
  removeDelayedJobs({
    queueName: MessageQueue.delayedJobsQueue,
    shouldRemove: (job) =>
      SNOOZE_END_JOB_NAMES.includes(job.name) &&
      threadIds.includes(job.data?.threadId),
  });
