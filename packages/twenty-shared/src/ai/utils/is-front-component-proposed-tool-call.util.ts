import { PUBLISH_FRONT_COMPONENT_TOOL_NAME } from '@/ai/constants/publish-front-component-tool-name.const';
import { type ProposedToolCall } from '@/ai/types/ProposedToolCall';

// Stored publication proposals may predate the frontComponent template.
export const isFrontComponentProposedToolCall = ({
  template,
  toolName,
}: Pick<ProposedToolCall, 'template' | 'toolName'>): boolean =>
  template === 'frontComponent' ||
  (template === 'generic' && toolName === PUBLISH_FRONT_COMPONENT_TOOL_NAME);
