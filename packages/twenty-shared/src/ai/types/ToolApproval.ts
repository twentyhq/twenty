import { type ProposedToolCallTemplate } from '@/ai/types/ProposedToolCallTemplate';

// How a proposed call to a tool is reviewed. The person may run one of the
// alternatives instead, such as saving a proposed email as a draft.
export type ToolApproval = {
  template: ProposedToolCallTemplate;
  alternativeToolNames?: string[];
};
