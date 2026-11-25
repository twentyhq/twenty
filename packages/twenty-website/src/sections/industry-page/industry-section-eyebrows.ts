import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { type IndustrySectionId } from '@/industries';

// Eyebrows are the framework's, not the page's: every industry page names
// its sections the same way so sales can navigate any of them.
export const INDUSTRY_SECTION_EYEBROWS: Record<
  IndustrySectionId,
  MessageDescriptor
> = {
  pains: msg`What teams tell us.`,
  dataModel: msg`The data model.`,
  workflows: msg`Workflows.`,
  agents: msg`AI agents.`,
  customScreen: msg`Custom screens.`,
  access: msg`Who sees what.`,
  switching: msg`Switching from Salesforce.`,
  proof: msg`In production.`,
  questions: msg`Common questions.`,
  discovery: msg`On the first call.`,
  related: msg`Explore the industry.`,
};
