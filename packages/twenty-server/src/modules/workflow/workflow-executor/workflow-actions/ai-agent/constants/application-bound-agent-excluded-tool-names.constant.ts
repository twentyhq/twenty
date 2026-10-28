import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';
import { SEND_CAMPAIGN_TEST_TOOL_NAME } from 'src/modules/emailing/constants/send-campaign-test-tool-name.constant';
import { SEND_CAMPAIGN_TOOL_NAME } from 'src/modules/emailing/constants/send-campaign-tool-name.constant';

export const APPLICATION_BOUND_AGENT_EXCLUDED_TOOL_NAMES = [
  'code_interpreter',
  'save_campaign',
  SEND_CAMPAIGN_TOOL_NAME,
  SEND_CAMPAIGN_TEST_TOOL_NAME,
  'send_email',
  'draft_email',
  'find_connected_accounts',
  'create_calendar_event',
] as const satisfies readonly (
  | ActionToolId
  | typeof SEND_CAMPAIGN_TOOL_NAME
  | typeof SEND_CAMPAIGN_TEST_TOOL_NAME
)[];
