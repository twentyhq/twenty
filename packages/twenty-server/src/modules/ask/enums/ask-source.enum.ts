// What is blocked on the answer, and therefore how answering resumes it: a
// paused workflow run re-enters the executor, an agent chat continues its
// stream. The two are not the same call, so the Ask records which it is
// rather than pretending they are.
export enum AskSource {
  WORKFLOW_RUN_STEP = 'WORKFLOW_RUN_STEP',
  AGENT_CHAT = 'AGENT_CHAT',
}
