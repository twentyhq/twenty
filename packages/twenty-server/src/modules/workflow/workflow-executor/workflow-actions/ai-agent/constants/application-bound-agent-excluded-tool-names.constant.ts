import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';

export const APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES = [
  'code_interpreter',
  'save_campaign',
  'send_email',
  'draft_email',
  'find_connected_accounts',
  'create_calendar_event',
] as const satisfies readonly ActionToolId[];
