import { type ActionToolId } from 'src/engine/core-modules/tool-provider/constants/action-tool-label.constant';

// they act with the member's role alone, so the role of the application a run acts through cannot narrow them
export const MEMBER_ROLE_ONLY_TOOL_NAMES = [
  'save_campaign',
] as const satisfies readonly ActionToolId[];
